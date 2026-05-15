import { NextRequest, NextResponse } from "next/server";

// modificar quando alterar os nomes para ingles para realizar a confirmacao correta

const USER_ROLES = ["ADMIN", "PROFESSOR", "MONITOR", "PESQUISADOR", "VISITANTE"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const routePermissions: Record<string, UserRole[]> = {
    "/admin": ["ADMIN"],
    "/professor": ["ADMIN", "PROFESSOR"],
    "/aluno": ["ADMIN", "VISITANTE"],
    "/courses": ["ADMIN", "PROFESSOR"],
    "/classes": ["ADMIN", "PROFESSOR", "MONITOR"],
    "/search": ["ADMIN", "PESQUISADOR"],
    "/projects": ["ADMIN", "PROFESSOR", "PESQUISADOR"],
    "/inventory": ["ADMIN", "PROFESSOR"],
    "/blog": ["ADMIN", "PROFESSOR", "MONITOR", "PESQUISADOR"],
    "/presence": ["ADMIN", "VISITANTE"],
    "/cursos": ["ADMIN", "PROFESSOR"],
    "/aulas": ["ADMIN", "PROFESSOR", "MONITOR"],
    "/pesquisa": ["ADMIN", "PESQUISADOR"],
    "/projetos": ["ADMIN", "PROFESSOR", "PESQUISADOR"],
    "/inventario": ["ADMIN", "PROFESSOR"],
    "/presenca": ["ADMIN", "VISITANTE"],
};
function isUserRole(value: unknown): value is UserRole {
    return USER_ROLES.includes(value as UserRole);
}

export function authorizeRole(req: NextRequest, role: unknown): NextResponse | undefined {
    const path = req.nextUrl.pathname;
    const matchedPath = Object.keys(routePermissions).find((p) => path.startsWith(p));

    if (!matchedPath) return undefined;

    if (!isUserRole(role) || !routePermissions[matchedPath].includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return undefined;
}
