export const roleRedirectMap: Record<string, string> = {
    ADMIN: "/professor/configuracoes",
    PROFESSOR: "/professor/configuracoes",
    MONITOR: "/monitor/controle-presenca",
    PESQUISADOR: "/pesquisador/relatorios",
    VISITANTE: "/estudante/profile",
};

export function getDashboardHref(role?: string | null): string {
    if (!role) return "/";
    const key = String(role).toUpperCase();
    return roleRedirectMap[key] ?? (key.startsWith("PROF") ? "/professor" : "/");
}
