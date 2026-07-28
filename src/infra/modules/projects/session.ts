import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type SessionUser = { id: string; role: string };

export async function requireUser(
    allowedRoles?: readonly string[]
): Promise<{ user: SessionUser; response?: never } | { user?: never; response: NextResponse }> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return { response: NextResponse.json({ message: "Não autenticado" }, { status: 401 }) };
    }

    const user: SessionUser = { id: session.user.id, role: session.user.role };

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return { response: NextResponse.json({ message: "Sem permissão para esta ação" }, { status: 403 }) };
    }

    return { user };
}

export const REVIEWER_ROLES = ["ADMIN", "PROFESSOR"] as const;

export async function readJsonBody(
    req: Request
): Promise<{ body: unknown; response?: never } | { response: NextResponse }> {
    try {
        return { body: await req.json() };
    } catch {
        return { response: NextResponse.json({ message: "Body inválido" }, { status: 400 }) };
    }
}
