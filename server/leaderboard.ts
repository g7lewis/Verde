import { db } from "./db";
import { monthlyContributions, monthlyLeaderboardSnapshots, pins, users, pinUpvotes } from "@shared/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

// --- Tier system ---
export type TierName = "sprout" | "sapling" | "timber" | "old_growth";

export interface TierDef {
  name: TierName;
  label: string;
  minPoints: number;
}

export const TIERS: TierDef[] = [
  { name: "old_growth", label: "Old Growth", minPoints: 500 },
  { name: "timber", label: "Timber", minPoints: 200 },
  { name: "sapling", label: "Sapling", minPoints: 50 },
  { name: "sprout", label: "Sprout", minPoints: 0 },
];

export function computeTier(points: number, rank?: number): TierName {
  // Top 3 always get Old Growth
  if (rank !== undefined && rank <= 3 && points > 0) return "old_growth";
  for (const tier of TIERS) {
    if (points >= tier.minPoints) return tier.name;
  }
  return "sprout";
}

// --- Month helpers ---
export function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getPreviousMonthKey(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// --- Point scoring ---
export interface PointBreakdown {
  base: number;
  streak: number;
  quality: number;
  diversity: number;
  total: number;
}

export function computePinPoints(
  description: string,
  streakDays: number,
  isFirstOfType: boolean,
): PointBreakdown {
  const base = 10;
  const streak = Math.min(streakDays, 20);
  const quality = description.length >= 50 ? 3 : 0;
  const diversity = isFirstOfType ? 5 : 0;
  return { base, streak, quality, diversity, total: base + streak + quality + diversity };
}

// --- Monthly points CRUD ---
export async function addMonthlyPoints(
  userId: string,
  points: number,
  action: "pin" | "explore" | "upvote_received",
): Promise<void> {
  const month = getCurrentMonthKey();

  // Upsert monthly contribution
  const existing = await db
    .select()
    .from(monthlyContributions)
    .where(and(eq(monthlyContributions.userId, userId), eq(monthlyContributions.month, month)));

  if (existing.length > 0) {
    const updates: Record<string, any> = {
      points: sql`${monthlyContributions.points} + ${points}`,
      updatedAt: new Date(),
    };
    if (action === "pin") updates.pinsDropped = sql`${monthlyContributions.pinsDropped} + 1`;
    if (action === "explore") updates.locationsExplored = sql`${monthlyContributions.locationsExplored} + 1`;
    if (action === "upvote_received") updates.upvotesReceived = sql`${monthlyContributions.upvotesReceived} + 1`;

    await db
      .update(monthlyContributions)
      .set(updates)
      .where(and(eq(monthlyContributions.userId, userId), eq(monthlyContributions.month, month)));
  } else {
    await db.insert(monthlyContributions).values({
      userId,
      month,
      points,
      pinsDropped: action === "pin" ? 1 : 0,
      locationsExplored: action === "explore" ? 1 : 0,
      upvotesReceived: action === "upvote_received" ? 1 : 0,
    });
  }
}

// --- Leaderboard queries ---
export interface LeaderboardEntry {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  points: number;
  pinsDropped: number;
  tier: TierName;
  rank: number;
}

export async function getLeaderboard(month: string, limit = 20): Promise<LeaderboardEntry[]> {
  const rows = await db
    .select({
      userId: monthlyContributions.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      points: monthlyContributions.points,
      pinsDropped: monthlyContributions.pinsDropped,
    })
    .from(monthlyContributions)
    .innerJoin(users, eq(monthlyContributions.userId, users.id))
    .where(eq(monthlyContributions.month, month))
    .orderBy(desc(monthlyContributions.points))
    .limit(limit);

  return rows.map((row, i) => ({
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    profileImageUrl: row.profileImageUrl,
    points: row.points ?? 0,
    pinsDropped: row.pinsDropped ?? 0,
    tier: computeTier(row.points ?? 0, i + 1),
    rank: i + 1,
  }));
}

export async function getPreviousLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const prevMonth = getPreviousMonthKey();

  // Check for snapshot first
  const snapshots = await db
    .select({
      userId: monthlyLeaderboardSnapshots.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      points: monthlyLeaderboardSnapshots.points,
      pinsDropped: monthlyLeaderboardSnapshots.pinsDropped,
      tier: monthlyLeaderboardSnapshots.tier,
      rank: monthlyLeaderboardSnapshots.rank,
    })
    .from(monthlyLeaderboardSnapshots)
    .innerJoin(users, eq(monthlyLeaderboardSnapshots.userId, users.id))
    .where(eq(monthlyLeaderboardSnapshots.month, prevMonth))
    .orderBy(monthlyLeaderboardSnapshots.rank)
    .limit(limit);

  if (snapshots.length > 0) {
    return snapshots.map((s) => ({
      userId: s.userId,
      firstName: s.firstName,
      lastName: s.lastName,
      profileImageUrl: s.profileImageUrl,
      points: s.points,
      pinsDropped: s.pinsDropped ?? 0,
      tier: s.tier as TierName,
      rank: s.rank,
    }));
  }

  // Lazy snapshot: generate and persist if there's data
  const entries = await getLeaderboard(prevMonth, limit);
  if (entries.length === 0) return [];

  await snapshotMonth(prevMonth);
  return entries;
}

export async function snapshotMonth(month: string): Promise<void> {
  // Check if already snapshotted
  const existing = await db
    .select({ id: monthlyLeaderboardSnapshots.id })
    .from(monthlyLeaderboardSnapshots)
    .where(eq(monthlyLeaderboardSnapshots.month, month))
    .limit(1);

  if (existing.length > 0) return;

  const entries = await getLeaderboard(month, 100);
  if (entries.length === 0) return;

  await db.insert(monthlyLeaderboardSnapshots).values(
    entries.map((e) => ({
      month,
      userId: e.userId,
      rank: e.rank,
      points: e.points,
      tier: e.tier,
      pinsDropped: e.pinsDropped,
    })),
  );
}

// --- Community stats ---
export interface CommunityStats {
  totalSeeds: number;
  totalMembers: number;
  totalUpvotes: number;
  locationsExplored: number;
  pinTypeDistribution: Record<string, number>;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [pinStats, memberCount, upvoteSum, explorationSum] = await Promise.all([
    db
      .select({
        type: pins.type,
        count: count(),
      })
      .from(pins)
      .groupBy(pins.type),
    db.select({ count: count() }).from(users),
    db
      .select({ total: sql<number>`coalesce(sum(${pins.upvotes}), 0)` })
      .from(pins),
    db
      .select({ total: sql<number>`coalesce(sum(${users.locationsExplored}), 0)` })
      .from(users),
  ]);

  const pinTypeDistribution: Record<string, number> = {};
  let totalSeeds = 0;
  for (const row of pinStats) {
    pinTypeDistribution[row.type] = row.count;
    totalSeeds += row.count;
  }

  return {
    totalSeeds,
    totalMembers: memberCount[0]?.count ?? 0,
    totalUpvotes: Number(upvoteSum[0]?.total ?? 0),
    locationsExplored: Number(explorationSum[0]?.total ?? 0),
    pinTypeDistribution,
  };
}

// --- Recent pins with user info ---
export interface RecentPin {
  id: number;
  lat: number;
  lng: number;
  type: string;
  description: string;
  upvotes: number;
  createdAt: Date | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export async function getRecentPins(limit = 50): Promise<RecentPin[]> {
  const rows = await db
    .select({
      id: pins.id,
      lat: pins.lat,
      lng: pins.lng,
      type: pins.type,
      description: pins.description,
      upvotes: pins.upvotes,
      createdAt: pins.createdAt,
      userId: pins.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(pins)
    .leftJoin(users, eq(pins.userId, users.id))
    .orderBy(desc(pins.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    type: r.type,
    description: r.description,
    upvotes: r.upvotes ?? 0,
    createdAt: r.createdAt,
    userId: r.userId,
    firstName: r.firstName,
    lastName: r.lastName,
    profileImageUrl: r.profileImageUrl,
  }));
}

// --- Upvote logic ---
export async function upvotePin(
  pinId: number,
  userId: string,
): Promise<{ success: boolean; message: string }> {
  // Check if already upvoted
  const existing = await db
    .select()
    .from(pinUpvotes)
    .where(and(eq(pinUpvotes.pinId, pinId), eq(pinUpvotes.userId, userId)));

  if (existing.length > 0) {
    return { success: false, message: "Already upvoted" };
  }

  // Get the pin to find its owner
  const [pin] = await db.select().from(pins).where(eq(pins.id, pinId));
  if (!pin) return { success: false, message: "Pin not found" };

  // Can't upvote own pin
  if (pin.userId === userId) {
    return { success: false, message: "Cannot upvote your own seed" };
  }

  // Record the upvote
  await db.insert(pinUpvotes).values({ pinId, userId });

  // Increment pin upvote count
  await db
    .update(pins)
    .set({ upvotes: sql`${pins.upvotes} + 1` })
    .where(eq(pins.id, pinId));

  // Award points to pin creator (max 25 per seed = 5 upvotes)
  if (pin.userId) {
    const upvoteCount = await db
      .select({ count: count() })
      .from(pinUpvotes)
      .where(eq(pinUpvotes.pinId, pinId));

    const totalUpvotesOnPin = upvoteCount[0]?.count ?? 0;
    if (totalUpvotesOnPin <= 5) {
      await addMonthlyPoints(pin.userId, 5, "upvote_received");
    }
  }

  return { success: true, message: "Upvoted!" };
}

// --- User rank lookup ---
export async function getUserRank(userId: string, month: string): Promise<{ rank: number; points: number; tier: TierName } | null> {
  const leaderboard = await getLeaderboard(month, 1000);
  const entry = leaderboard.find((e) => e.userId === userId);
  return entry ? { rank: entry.rank, points: entry.points, tier: entry.tier } : null;
}
