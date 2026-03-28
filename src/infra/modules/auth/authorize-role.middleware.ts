import { UserRole } from "@/src/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export const routePermissions: Record<string, UserRole[]> = {
    "/admin": [UserRole.ADMIN],
    "/cursos": [UserRole.ADMIN, UserRole.TEACHER],
    "/aulas": [UserRole.ADMIN, UserRole.TEACHER, UserRole.MONITOR],
    "/pesquisa": [UserRole.ADMIN, UserRole.RESEARCHER],
    "/projetos": [UserRole.ADMIN, UserRole.TEACHER, UserRole.RESEARCHER],
    "/inventario": [UserRole.ADMIN, UserRole.TEACHER],
    "/blog": [UserRole.ADMIN, UserRole.TEACHER, UserRole.MONITOR, UserRole.RESEARCHER],
    "/presenca": [UserRole.ADMIN, UserRole.VISITOR],
};

export function authorizeRole(req: NextRequest, role: UserRole): NextResponse | undefined {
    const path = req.nextUrl.pathname;

    const matchedPath = Object.keys(routePermissions).find((p) => path.startsWith(p));

    if (matchedPath && !routePermissions[matchedPath].includes(role)) {
        return new NextResponse(JSON.stringify({ message: "Acesso negado: privilégios insuficientes" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    return undefined;
}
