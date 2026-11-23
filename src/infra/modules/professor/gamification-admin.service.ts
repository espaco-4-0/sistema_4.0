import api from "@/lib/axios";

export const EVENT_LABELS: Record<string, string> = {
    PRESENCE_CONFIRMED: "Presença confirmada",
    COURSE_ENROLLED: "Inscrição em curso",
    COURSE_COMPLETED: "Curso concluído",
    TASK_COMPLETED: "Tarefa concluída",
    PROJECT_APPROVED: "Projeto aprovado",
    BLOG_POST_PUBLISHED: "Post publicado no blog",
};

export const CRITERIA_LABELS: Record<string, string> = {
    MANUAL: "Atribuição manual",
    XP_TOTAL: "XP acumulado",
    PRESENCE_COUNT: "Presenças confirmadas",
    COURSE_COUNT: "Cursos matriculados",
    PROJECT_COUNT: "Projetos participados",
    TASK_COUNT: "Tarefas concluídas",
};

export interface GamificationRule {
    event: string;
    xp: number;
    points: number;
    isActive: boolean;
}

export interface BadgeAdminItem {
    id: string;
    name: string;
    description: string | null;
    points: number;
    criteria: string;
    criteriaValue: number | null;
    isActive: boolean;
    _count?: { userBadges?: number };
}

export interface BadgeInput {
    name: string;
    description?: string | null;
    points: number;
    criteria: string;
    criteriaValue?: number | null;
    isActive?: boolean;
}

export async function getRules(): Promise<GamificationRule[]> {
    const { data } = await api.get("/api/gamification/rules");
    return data.data ?? [];
}

export async function saveRules(rules: GamificationRule[]): Promise<GamificationRule[]> {
    const { data } = await api.put("/api/gamification/rules", { rules });
    return data.data ?? [];
}

export async function createBadge(payload: BadgeInput) {
    const { data } = await api.post("/api/gamification/badges", payload);
    return data;
}

export async function updateBadge(id: string, payload: Partial<BadgeInput>) {
    const { data } = await api.put(`/api/gamification/badges/${id}`, payload);
    return data;
}

export async function deleteBadge(id: string): Promise<void> {
    await api.delete(`/api/gamification/badges/${id}`);
}

export async function grantBadge(userId: string, badgeId: string) {
    const { data } = await api.post("/api/gamification/badges/grant", { userId, badgeId });
    return data;
}
