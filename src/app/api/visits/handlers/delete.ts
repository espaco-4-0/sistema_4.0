import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";
import { isAdmin } from "./get";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
        id: (session.user as any).id as string,
        role: (session.user as any).role as string,
    };
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Maceio" });
}

export async function deleteHandlers(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));

        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        await prisma.visit.delete({ where: { id } });
        return NextResponse.json({ message: "Visita removida com sucesso" });
    } catch (error) {
        console.error("[DELETE /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}
