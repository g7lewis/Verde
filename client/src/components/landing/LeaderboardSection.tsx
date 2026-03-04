import { useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrentLeaderboard, usePreviousLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/hooks/use-auth";
import { TierBadge } from "./TierBadge";
import { TIERS, getDisplayName, type LeaderboardEntry } from "@/lib/leaderboard";
import clsx from "clsx";

const MEDAL_COLORS = ["text-amber-500", "text-gray-400", "text-amber-700"];
const MEDAL_BG = ["bg-amber-50 border-amber-200", "bg-gray-50 border-gray-200", "bg-amber-50/50 border-amber-200/50"];

function TopThreeCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={clsx(
        "rounded-2xl border-2 p-5 text-center shadow-sm",
        MEDAL_BG[index],
      )}
    >
      <div className={clsx("text-3xl font-bold mb-2", MEDAL_COLORS[index])}>
        <Trophy className="w-8 h-8 mx-auto" />
      </div>
      <div className="w-12 h-12 rounded-full mx-auto bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-lg font-bold mb-2">
        {entry.firstName?.charAt(0) || "?"}
      </div>
      <p className="font-semibold text-foreground">
        {getDisplayName(entry.firstName, entry.lastName)}
      </p>
      <div className="flex justify-center mt-2">
        <TierBadge tier={entry.tier} size="sm" />
      </div>
      <p className="text-2xl font-bold text-foreground mt-2">{entry.points}</p>
      <p className="text-xs text-muted-foreground">points</p>
    </motion.div>
  );
}

export function LeaderboardSection() {
  const [tab, setTab] = useState<"current" | "previous">("current");
  const { data: currentData } = useCurrentLeaderboard();
  const { data: previousData } = usePreviousLeaderboard();
  const { user } = useAuth();

  const entries =
    tab === "current" ? currentData?.entries ?? [] : previousData?.entries ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const userRank = tab === "current" ? currentData?.userRank : null;
  const monthLabel = currentData?.month
    ? (() => {
        const [year, month] = currentData.month.split("-");
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
      })()
    : "";

  return (
    <section id="canopy" className="py-20 bg-gradient-to-b from-emerald-50/50 to-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display mb-2">
            The Canopy
          </h2>
          <p className="text-muted-foreground text-lg">{monthLabel || "Monthly Leaderboard"}</p>
        </motion.div>

        {/* Tier legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TIERS.map((t) => (
            <div key={t.name} className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-border/50">
              <TierBadge tier={t.name} size="sm" />
              <span className="text-xs text-muted-foreground">{t.minPoints}+ pts</span>
            </div>
          ))}
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-full p-1">
            <button
              onClick={() => setTab("current")}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                tab === "current"
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              This Month
            </button>
            <button
              onClick={() => setTab("previous")}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                tab === "previous"
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Top 3 spotlight */}
        {top3.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {top3.map((entry, i) => (
              <TopThreeCard key={entry.userId} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No contributors yet this month.</p>
            <p className="text-sm">
              <a href="/map" className="text-emerald-600 font-medium hover:underline">
                Plant the first seed
              </a>{" "}
              to top the leaderboard!
            </p>
          </div>
        )}

        {/* Remaining top 10 */}
        {rest.length > 0 && (
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Contributor</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Tier</th>
                  <th className="text-right px-4 py-3">Points</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">Seeds</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={clsx(
                      "border-b border-border/30 last:border-b-0",
                      user?.id === entry.userId && "bg-emerald-50/50",
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                      #{entry.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-300 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                          {entry.firstName?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {getDisplayName(entry.firstName, entry.lastName)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <TierBadge tier={entry.tier} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {entry.points}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden sm:table-cell">
                      {entry.pinsDropped}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User's own rank */}
        {userRank && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-emerald-800">Your Rank</span>
              <span className="text-lg font-bold text-emerald-700">#{userRank.rank}</span>
            </div>
            <div className="flex items-center gap-4">
              <TierBadge tier={userRank.tier} size="sm" />
              <span className="text-sm font-semibold text-emerald-700">{userRank.points} pts</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
