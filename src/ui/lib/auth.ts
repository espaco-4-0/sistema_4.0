import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type Token = Awaited<ReturnType<typeof getToken>>;

export async function getAuthToken(request: NextRequest): Promise<Token> {
    return getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
}

export function isAdmin(token: Token): boolean {
    return !!token && typeof token !== "string" && token.role === "ADMIN";
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
    const token = await getAuthToken(request);

    if (!token) {
        return NextResponse.json(
            {
                message: "Nao Autorizado",
            },
            { status: 401 }
        );
    }

    if (!isAdmin(token)) {
        return NextResponse.json(
            {
                message: "Acesso não permitido",
            },
            { status: 403 }
        );
    }

    return null;
}
