import { NextRequest, NextResponse } from "next/server";

const USER_ROLES = ["ADMIN", "PROFESSOR", "MONITOR", "RESEARCHER", "VISITOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const routePermissions: Record<string, UserRole[]> = {
    "/admin": ["ADMIN"],
    "/professor": ["ADMIN"],
    "/courses": ["ADMIN", "PROFESSOR", "MONITOR", "RESEARCHER"],
    "/classes": ["ADMIN", "PROFESSOR", "MONITOR"],
    "/search": ["ADMIN", "RESEARCHER"],
    "/projects": ["ADMIN", "PROFESSOR", "RESEARCHER"],
    "/inventory": ["ADMIN", "PROFESSOR"],
    "/blog": ["ADMIN", "PROFESSOR", "MONITOR", "RESEARCHER"],
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
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return undefined;
}
