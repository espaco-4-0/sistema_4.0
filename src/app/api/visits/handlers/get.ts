import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

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

export function isAdmin(role: string) {
    return role === "ADMIN" || role === "admin";
}

export async function getHandlers() {
    try {
        const user = await getSessionUser();
        const adminUser = user && isAdmin(user.role);

        if (adminUser) {
            const visits = await prisma.visit.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    documentos: {
                        select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                    },
                },
            });
            return NextResponse.json(visits);
        }

        const visits = await prisma.visit.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, instituicao: true, dataVisita: true, horaInicio: true, horaFim: true, status: true },
        });
        return NextResponse.json(visits);
    } catch (error) {
        console.error("[GET /api/visits]", error);
        return NextResponse.json({ message: "Erro interno do servidor", error: String(error) }, { status: 500 });
    }
}
