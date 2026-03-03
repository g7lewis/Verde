import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeaderboardResponse, LeaderboardEntry } from "@/lib/leaderboard";

export function useCurrentLeaderboard() {
  return useQuery<LeaderboardResponse>({
    queryKey: ["/api/leaderboard/current"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/current", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 60_000, // 1 minute
  });
}

export function usePreviousLeaderboard() {
  return useQuery<{ entries: LeaderboardEntry[] }>({
    queryKey: ["/api/leaderboard/previous"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/previous");
      if (!res.ok) throw new Error("Failed to fetch previous leaderboard");
      return res.json();
    },
    staleTime: 300_000, // 5 minutes
  });
}

export function useUpvotePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pinId: number) => {
      const res = await fetch(`/api/pins/${pinId}/upvote`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upvote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pins/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pins"] });
    },
  });
}

export function useRecentPins() {
  return useQuery({
    queryKey: ["/api/pins/recent"],
    queryFn: async () => {
      const res = await fetch("/api/pins/recent");
      if (!res.ok) throw new Error("Failed to fetch recent pins");
      return res.json();
    },
    staleTime: 30_000,
  });
}
