import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Flame, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeType } from '@/lib/gamification';
import { computeTierFromPoints } from '@/lib/leaderboard';
import { TierBadge } from '@/components/landing/TierBadge';

interface GamificationPanelProps {
  stats: {
    points: number;
    pinsDropped: number;
    locationsExplored: number;
    streak: number;
    badges: BadgeType[];
  } | null;
  levelInfo: {
    level: number;
    title: string;
    progress: number;
    nextLevelPoints: number;
  } | null;
}

export function GamificationPanel({ stats, levelInfo }: GamificationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats || !levelInfo) return null;

  const earnedBadges = stats.badges.filter(b => b.earned);
  const unearnedBadges = stats.badges.filter(b => !b.earned);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden" data-testid="gamification-panel">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover-elevate transition-colors"
        data-testid="button-toggle-gamification"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Level {levelInfo.level} - {levelInfo.title}</span>
              <TierBadge tier={computeTierFromPoints(stats.points)} size="sm" showLabel={false} />
            </div>
            <div className="text-xs text-muted-foreground">{stats.points} points</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500" data-testid="text-streak">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">{stats.streak}</span>
            </div>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress to Level {levelInfo.level + 1}</span>
                  <span className="font-medium">{Math.round(levelInfo.progress)}%</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {stats.points} / {levelInfo.nextLevelPoints} XP
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-xl p-2" data-testid="stat-pins">
                  <Target className="w-4 h-4 mx-auto text-green-600 mb-1" />
                  <div className="text-lg font-bold">{stats.pinsDropped}</div>
                  <div className="text-xs text-muted-foreground">Pins</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2" data-testid="stat-explored">
                  <Star className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <div className="text-lg font-bold">{stats.locationsExplored}</div>
                  <div className="text-xs text-muted-foreground">Explored</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2" data-testid="stat-badges">
                  <Award className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                  <div className="text-lg font-bold">{earnedBadges.length}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
              </div>

              {earnedBadges.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Earned Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map(badge => (
                      <div 
                        key={badge.id}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-2.5 py-1"
                        title={badge.description}
                        data-testid={`badge-${badge.id}`}
                      >
                        <span className="text-sm">{badge.icon}</span>
                        <span className="text-xs font-medium text-amber-800">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unearnedBadges.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Next Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {unearnedBadges.slice(0, 4).map(badge => (
                      <div 
                        key={badge.id}
                        className="flex items-center gap-1.5 bg-muted/30 border border-muted rounded-full px-2.5 py-1 opacity-60"
                        title={`${badge.description} (${badge.requirement} required)`}
                        data-testid={`badge-locked-${badge.id}`}
                      >
                        <span className="text-sm grayscale">{badge.icon}</span>
                        <span className="text-xs text-muted-foreground">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
