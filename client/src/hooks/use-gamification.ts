import { useState, useEffect, useCallback } from 'react';
import { 
  UserStats, 
  Badge, 
  loadStats, 
  saveStats, 
  awardPinDrop, 
  awardExploration,
  getLevel 
} from '@/lib/gamification';

export function useGamification() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const recordPinDrop = useCallback(() => {
    if (!stats) return;
    const result = awardPinDrop(stats);
    setStats(result.stats);
    saveStats(result.stats);
    if (result.newBadges.length > 0) {
      setNewBadges(result.newBadges);
    }
  }, [stats]);

  const recordExploration = useCallback(() => {
    if (!stats) return;
    const result = awardExploration(stats);
    setStats(result.stats);
    saveStats(result.stats);
    if (result.newBadges.length > 0) {
      setNewBadges(result.newBadges);
    }
  }, [stats]);

  const clearNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);

  const levelInfo = stats ? getLevel(stats.points) : null;

  return {
    stats,
    levelInfo,
    newBadges,
    recordPinDrop,
    recordExploration,
    clearNewBadges,
  };
}
