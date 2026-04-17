import { NextRequest, NextResponse } from "next/server";

const USER_ROLES = ["ADMIN", "TEACHER", "MONITOR", "RESEARCHER", "VISITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const protectedRouteMatchers = [
    "/admin/:path*",
    "/courses/:path*",
    "/classes/:path*",
    "/search/:path*",
    "/projects/:path*",
    "/inventory/:path*",
    "/blog/:path*",
    "/presence/:path*",
    "/cursos/:path*",
    "/aulas/:path*",
    "/pesquisa/:path*",
    "/projetos/:path*",
    "/inventario/:path*",
    "/presenca/:path*",
] as const;

export const routePermissions: Record<string, UserRole[]> = {
    "/admin": ["ADMIN"],
    "/courses": ["ADMIN", "TEACHER"],
    "/classes": ["ADMIN", "TEACHER", "MONITOR"],
    "/search": ["ADMIN", "RESEARCHER"],
    "/projects": ["ADMIN", "TEACHER", "RESEARCHER"],
    "/inventory": ["ADMIN", "TEACHER"],
    "/blog": ["ADMIN", "TEACHER", "MONITOR", "RESEARCHER"],
    "/presence": ["ADMIN", "VISITOR"],
    "/cursos": ["ADMIN", "TEACHER"],
    "/aulas": ["ADMIN", "TEACHER", "MONITOR"],
    "/pesquisa": ["ADMIN", "RESEARCHER"],
    "/projetos": ["ADMIN", "TEACHER", "RESEARCHER"],
    "/inventario": ["ADMIN", "TEACHER"],
    "/presenca": ["ADMIN", "VISITOR"],
};

function isUserRole(value: unknown): value is UserRole {
    return USER_ROLES.includes(value as UserRole);
}

export function authorizeRole(req: NextRequest, role: unknown): NextResponse | undefined {
    const path = req.nextUrl.pathname;

    const matchedPath = Object.keys(routePermissions).find((p) => path.startsWith(p));

    if (!matchedPath) {
        return undefined;
    }

    if (!isUserRole(role) || !routePermissions[matchedPath].includes(role)) {
        return new NextResponse(JSON.stringify({ message: "Acesso negado: privilégios insuficientes" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    return undefined;
}
