import { NextRequest, NextResponse } from "next/server";

const USER_ROLES = ["ADMIN", "PROFESSOR", "MONITOR", "RESEARCHER", "VISITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const routePermissions: Record<string, UserRole[]> = {
    "/admin": ["ADMIN"],
    "/professor": ["ADMIN", "PROFESSOR", "MONITOR"],
    "/estudante": ["ADMIN", "VISITOR"],
    "/classes": ["ADMIN", "PROFESSOR", "MONITOR"],
    "/search": ["ADMIN", "RESEARCHER"],
    "/projects": ["ADMIN", "PROFESSOR", "RESEARCHER"],
    "/inventory": ["ADMIN", "PROFESSOR"],
    "/presence": ["ADMIN", "VISITOR"],
    "/visita": ["ADMIN", "VISITOR"],
};

function isUserRole(value: unknown): value is UserRole {
    return USER_ROLES.includes(value as UserRole);
}

export function authorizeRole(req: NextRequest, role: unknown): NextResponse | undefined {
    const path = req.nextUrl.pathname;
    const matchedPath = Object.keys(routePermissions).find((p) => path.startsWith(p));

    if (!matchedPath) return undefined;

    if (!isUserRole(role) || !routePermissions[matchedPath].includes(role)) {
        // Não redirecionar para /login: o usuário já está autenticado neste ponto
        // (o proxy só chama esta função com token). O /login manda usuário logado
        // de volta para a callbackUrl, e o par vira um loop de redirect.
        return NextResponse.redirect(new URL("/", req.url));
    }

    return undefined;
}
