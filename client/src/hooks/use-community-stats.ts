import { useQuery } from "@tanstack/react-query";
import type { CommunityStats } from "@/lib/leaderboard";

export function useCommunityStats() {
  return useQuery<CommunityStats>({
    queryKey: ["/api/stats/community"],
    queryFn: async () => {
      const res = await fetch("/api/stats/community");
      if (!res.ok) throw new Error("Failed to fetch community stats");
      return res.json();
    },
    staleTime: 120_000, // 2 minutes
  });
}
