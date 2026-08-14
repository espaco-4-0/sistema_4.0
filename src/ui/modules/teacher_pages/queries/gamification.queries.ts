import {
    createBadge,
    deleteBadge,
    getRules,
    saveRules,
    updateBadge,
    type BadgeInput,
} from "@/src/infra/modules/professor/gamification-admin.service";
import { getBadges, getLeaderboard, getMyGamification } from "@/src/infra/modules/professor/gamification.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiErrorPayload = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

function gamificationError(error: unknown, fallback: string): string {
    const payload = (error as ApiErrorPayload)?.response?.data;
    if (!payload) return fallback;

    if (payload.errors) {
        const first = Object.values(payload.errors).flat()[0];
        if (first) return first;
    }

    return payload.message || fallback;
}

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

export function useGamificationRules() {
    return useQuery({
        queryKey: ["gamification", "rules"],
        queryFn: getRules,
        staleTime: 60 * 1000,
    });
}

export function useSaveRules() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveRules,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification"] });
            toast.success("Regras de pontuação salvas.");
        },
        onError: (error) => toast.error(gamificationError(error, "Erro ao salvar as regras.")),
    });
}

export function useCreateBadge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification"] });
            toast.success("Badge criada.");
        },
        onError: (error) => toast.error(gamificationError(error, "Erro ao criar badge.")),
    });
}

export function useUpdateBadge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<BadgeInput> }) => updateBadge(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification"] });
            toast.success("Badge atualizada.");
        },
        onError: (error) => toast.error(gamificationError(error, "Erro ao atualizar badge.")),
    });
}

export function useDeleteBadge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification"] });
            toast.success("Badge excluída.");
        },
        onError: (error) => toast.error(gamificationError(error, "Erro ao excluir badge.")),
    });
}
