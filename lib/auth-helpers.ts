import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/ui/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const getAuthenticatedUser = async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return {
            user: null,
            error: NextResponse.json({ message: "Não autenticado" }, { status: 401 }),
        };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            nomeCompleto: true,
            email: true,
            role: true,
            ativo: true,
        },
    });

    if (!user) {
        return {
            user: null,
            error: NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 }),
        };
    }

    if (!user.ativo) {
        return {
            user: null,
            error: NextResponse.json({ message: "Conta desativada" }, { status: 403 }),
        };
    }

    return { user, error: null };
};

export const requireRole = (userRole: string, ...allowedRoles: string[]) => {
    if (!allowedRoles.includes(userRole)) {
        return NextResponse.json({ message: "Sem permissão" }, { status: 403 });
    }
    return null;
};
