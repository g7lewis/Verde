import { Sprout, TreeDeciduous, TreePine, Trees } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TierName = "sprout" | "sapling" | "timber" | "old_growth";

export interface TierDef {
  name: TierName;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  gradientClass: string;
  minPoints: number;
}

export const TIERS: TierDef[] = [
  {
    name: "sprout",
    label: "Sprout",
    icon: Sprout,
    colorClass: "text-emerald-400",
    gradientClass: "from-emerald-200 to-emerald-400",
    minPoints: 0,
  },
  {
    name: "sapling",
    label: "Sapling",
    icon: TreeDeciduous,
    colorClass: "text-green-500",
    gradientClass: "from-green-400 to-green-600",
    minPoints: 50,
  },
  {
    name: "timber",
    label: "Timber",
    icon: TreePine,
    colorClass: "text-teal-600",
    gradientClass: "from-teal-500 to-emerald-700",
    minPoints: 200,
  },
  {
    name: "old_growth",
    label: "Old Growth",
    icon: Trees,
    colorClass: "text-amber-500",
    gradientClass: "from-amber-400 to-yellow-600",
    minPoints: 500,
  },
];

export function getTierDef(tierName: TierName): TierDef {
  return TIERS.find((t) => t.name === tierName) ?? TIERS[0];
}

export function computeTierFromPoints(points: number, rank?: number): TierName {
  if (rank !== undefined && rank <= 3 && points > 0) return "old_growth";
  if (points >= 500) return "old_growth";
  if (points >= 200) return "timber";
  if (points >= 50) return "sapling";
  return "sprout";
}

export function getTierProgress(points: number): { current: TierDef; next: TierDef | null; progress: number } {
  const tier = computeTierFromPoints(points);
  const current = getTierDef(tier);

  // Find next tier (TIERS is ordered sprout → old_growth)
  const currentIdx = TIERS.findIndex((t) => t.name === tier);
  const next = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;

  if (!next) return { current, next: null, progress: 100 };

  const range = next.minPoints - current.minPoints;
  const progress = Math.min(((points - current.minPoints) / range) * 100, 100);
  return { current, next, progress };
}

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

export interface LeaderboardResponse {
  month: string;
  entries: LeaderboardEntry[];
  userRank: { rank: number; points: number; tier: TierName } | null;
}

export interface CommunityStats {
  totalSeeds: number;
  totalMembers: number;
  totalUpvotes: number;
  locationsExplored: number;
  pinTypeDistribution: Record<string, number>;
}

export interface RecentPin {
  id: number;
  lat: number;
  lng: number;
  type: string;
  description: string;
  upvotes: number;
  createdAt: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export function getDisplayName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName.charAt(0)}.`;
  if (firstName) return firstName;
  return "Anonymous";
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "some time ago";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
