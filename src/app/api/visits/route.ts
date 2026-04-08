import { prisma } from "@/src/ui/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as pdf from "pdf-parse";

import { authOptions } from "../auth/[...nextauth]/route";

const MAX_SIZE = 5 * 1024 * 1024; // refere a ser 5
const ALLOWED_STATUS = ["aprovado", "rejeitado"];
const LIMIT_DATE = 7 * 24 * 60 * 60 * 1000; //em resumo isso refere a ser 7 dias

// limpeza do banco aquuiiiiii
async function cleanExpiredVisits() {
    const expirationDate = new Date(Date.now() - LIMIT_DATE);

    await prisma.visit.deleteMany({
        where: {
            createdAt: {
                lt: expirationDate,
            },
        },
    });
}

// Função mock pra pegar usuário logado
async function getSessionUser() {
    const session = await getServerSession(authOptions);

    if (!session?.user) return null;

    return {
        id: (session.user as any).id as string,
        role: (session.user as any).role as "admin" | "user",
    };
}

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("pdf");

        // Verifica existência antes de acessar propriedades
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ message: "PDF não encontrado" }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: "Arquivo muito grande. Máximo 5MB." }, { status: 413 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const data = await (pdf as any)(buffer);

        const status = data.text.toLowerCase().includes("aprovado") ? "aprovado" : "pendente";

        const visit = await prisma.visit.create({
            data: {
                userId: user.id,
                status,
                message: "Visita criada",
            },
        });

        return NextResponse.json(visit);
    } catch (error) {
        return NextResponse.json({ message: "Internal Error", error: String(error) }, { status: 500 });
    }
}

// Admin lista todas visitas, oque nos permite so chamar via area do admin
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ message: "NOT AUTENTICATE" }, { status: 401 });
        }

        // veja a condicao
        if (user.role !== "admin") {
            return NextResponse.json({ message: "ACESS DENIED" }, { status: 403 });
        }

        // Limpeza automática antes de listar
        await cleanExpiredVisits();

        const visits = await prisma.visit.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json(visits);
    } catch (error) {
        return NextResponse.json({ message: "Internal Error", error: String(error) }, { status: 500 });
    }
}

// Admin irá aprova ou rejeita visita na teoria
export async function PATCH(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        // atencao na condicao
        if (user.role !== "admin") {
            return NextResponse.json({ message: "ACESS DENIED" }, { status: 403 });
        }

        const body = await req.json();
        const { id, newStatus } = body as { id: number; newStatus: string };

        if (!ALLOWED_STATUS.includes(newStatus)) {
            return NextResponse.json({ message: "Status inválido" }, { status: 400 });
        }

        const visit = await prisma.visit.update({
            where: { id },
            data: { status: newStatus, message: `Visita ${newStatus}` },
        });

        return NextResponse.json(visit);
    } catch (error) {
        return NextResponse.json({ message: "Internal Error", error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (user.role !== "admin") {
            return NextResponse.json({ message: "ACESS DENIED" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));

        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        await prisma.visit.delete({ where: { id } });

        return NextResponse.json({ message: "Visita removida com sucesso" });
    } catch (error) {
        return NextResponse.json({ message: "Internal Error", error: String(error) }, { status: 500 });
    }
}
