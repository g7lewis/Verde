export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'pins' | 'exploration' | 'community';
  earned: boolean;
  earnedAt?: string;
}

export interface UserStats {
  points: number;
  pinsDropped: number;
  locationsExplored: number;
  streak: number;
  lastActivity: string;
  badges: Badge[];
}

export const BADGE_DEFINITIONS: Omit<Badge, 'earned' | 'earnedAt'>[] = [
  { id: 'first_pin', name: 'First Steps', description: 'Drop your first pin', icon: '🌱', requirement: 1, type: 'pins' },
  { id: 'explorer_5', name: 'Explorer', description: 'Drop 5 pins', icon: '🧭', requirement: 5, type: 'pins' },
  { id: 'naturalist', name: 'Naturalist', description: 'Drop 10 pins', icon: '🦋', requirement: 10, type: 'pins' },
  { id: 'eco_warrior', name: 'Eco Warrior', description: 'Drop 25 pins', icon: '🌿', requirement: 25, type: 'pins' },
  { id: 'guardian', name: 'Guardian', description: 'Drop 50 pins', icon: '🛡️', requirement: 50, type: 'pins' },
  { id: 'legend', name: 'Legend', description: 'Drop 100 pins', icon: '🏆', requirement: 100, type: 'pins' },
  { id: 'curious', name: 'Curious', description: 'Explore 5 locations', icon: '🔍', requirement: 5, type: 'exploration' },
  { id: 'wanderer', name: 'Wanderer', description: 'Explore 15 locations', icon: '🗺️', requirement: 15, type: 'exploration' },
  { id: 'globetrotter', name: 'Globetrotter', description: 'Explore 50 locations', icon: '🌍', requirement: 50, type: 'exploration' },
];

export const POINTS = {
  PIN_DROP: 10,
  LOCATION_EXPLORE: 5,
  STREAK_BONUS: 2,
  BADGE_EARNED: 25,
};

const STORAGE_KEY = 'ecovibe_user_stats';

export function getDefaultStats(): UserStats {
  return {
    points: 0,
    pinsDropped: 0,
    locationsExplored: 0,
    streak: 0,
    lastActivity: new Date().toISOString(),
    badges: BADGE_DEFINITIONS.map(b => ({ ...b, earned: false })),
  };
}

export function loadStats(): UserStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserStats;
      const existingBadgeIds = new Set(parsed.badges.map(b => b.id));
      const updatedBadges = [
        ...parsed.badges,
        ...BADGE_DEFINITIONS.filter(b => !existingBadgeIds.has(b.id)).map(b => ({ ...b, earned: false })),
      ];
      return { ...parsed, badges: updatedBadges };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return getDefaultStats();
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export function checkBadges(stats: UserStats): { stats: UserStats; newBadges: Badge[] } {
  const newBadges: Badge[] = [];
  let pointsToAdd = 0;
  
  const updatedBadges = stats.badges.map(badge => {
    if (badge.earned) return badge;
    
    let earned = false;
    if (badge.type === 'pins' && stats.pinsDropped >= badge.requirement) {
      earned = true;
    } else if (badge.type === 'exploration' && stats.locationsExplored >= badge.requirement) {
      earned = true;
    }
    
    if (earned) {
      const earnedBadge = { ...badge, earned: true, earnedAt: new Date().toISOString() };
      newBadges.push(earnedBadge);
      pointsToAdd += POINTS.BADGE_EARNED;
      return earnedBadge;
    }
    return badge;
  });
  
  return {
    stats: { ...stats, badges: updatedBadges, points: stats.points + pointsToAdd },
    newBadges,
  };
}

export function awardPinDrop(currentStats: UserStats): { stats: UserStats; newBadges: Badge[] } {
  const now = new Date();
  const lastActivity = new Date(currentStats.lastActivity);
  const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  let streakBonus = 0;
  let newStreak = currentStats.streak;
  
  if (hoursSinceLastActivity < 24) {
    newStreak += 1;
    streakBonus = Math.min(newStreak * POINTS.STREAK_BONUS, 20);
  } else if (hoursSinceLastActivity > 48) {
    newStreak = 1;
  }
  
  const updatedStats: UserStats = {
    ...currentStats,
    points: currentStats.points + POINTS.PIN_DROP + streakBonus,
    pinsDropped: currentStats.pinsDropped + 1,
    streak: newStreak,
    lastActivity: now.toISOString(),
  };
  
  return checkBadges(updatedStats);
}

export function awardExploration(currentStats: UserStats): { stats: UserStats; newBadges: Badge[] } {
  const updatedStats: UserStats = {
    ...currentStats,
    points: currentStats.points + POINTS.LOCATION_EXPLORE,
    locationsExplored: currentStats.locationsExplored + 1,
    lastActivity: new Date().toISOString(),
  };
  
  return checkBadges(updatedStats);
}

export function getLevel(points: number): { level: number; title: string; progress: number; nextLevelPoints: number } {
  const levels = [
    { threshold: 0, title: 'Newcomer' },
    { threshold: 50, title: 'Observer' },
    { threshold: 150, title: 'Contributor' },
    { threshold: 300, title: 'Advocate' },
    { threshold: 500, title: 'Champion' },
    { threshold: 800, title: 'Expert' },
    { threshold: 1200, title: 'Master' },
    { threshold: 2000, title: 'Legend' },
  ];
  
  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }
  
  const current = levels[currentLevel];
  const next = levels[currentLevel + 1] || { threshold: current.threshold + 500, title: 'Ultimate' };
  const progress = ((points - current.threshold) / (next.threshold - current.threshold)) * 100;
  
  return {
    level: currentLevel + 1,
    title: current.title,
    progress: Math.min(progress, 100),
    nextLevelPoints: next.threshold,
  };
}
