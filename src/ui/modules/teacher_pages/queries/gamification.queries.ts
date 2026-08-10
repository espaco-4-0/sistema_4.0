import { getBadges, getLeaderboard, getMyGamification } from "@/src/infra/modules/professor/gamification.service";
import { useQuery } from "@tanstack/react-query";

export function useLeaderboard(limit = 10) {
    return useQuery({
        queryKey: ["gamification", "leaderboard", limit],
        queryFn: () => getLeaderboard(limit),
        staleTime: 60 * 1000,
    });
}

export function useBadges() {
    return useQuery({
        queryKey: ["gamification", "badges"],
        queryFn: getBadges,
        staleTime: 5 * 60 * 1000,
    });
}

export function useMyGamification() {
    return useQuery({
        queryKey: ["gamification", "me"],
        queryFn: getMyGamification,
        staleTime: 60 * 1000,
    });
}
