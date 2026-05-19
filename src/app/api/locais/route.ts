import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export const mapLocationToFrontend = (loc: any) => ({
    id: loc.id,
    nome: loc.name,
    descricao: loc.description,
    capacidade: loc.capacity,
    duracaoMin: loc.durationMin,
    ativo: loc.isActive,
    createdAt: loc.createdAt,
    updatedAt: loc.updatedAt,
});

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;
        const includeInactive = searchParams.get("includeInactive") === "true";
        const q = searchParams.get("q") ?? undefined;

        if (includeInactive) {
            const session = await getServerSession(authOptions);
            if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
            if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const where: any = {};
        if (!includeInactive) where.isActive = true;
        if (q) {
            where.name = { contains: q, mode: "insensitive" };
        }

        const locais = await prisma.location.findMany({
            where,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                description: true,
                capacity: true,
                durationMin: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const mappedLocais = locais.map(mapLocationToFrontend);

        return NextResponse.json({ data: mappedLocais }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/locais]", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const body = (await req.json()) ?? {};
        const nome = String(body.nome ?? "").trim();
        const descricao = body.descricao ? String(body.descricao) : null;
        const capacidade = body.capacidade !== undefined ? Number(body.capacidade) : undefined;
        const duracaoMin = body.duracaoMin !== undefined ? Number(body.duracaoMin) || null : undefined;
        const ativo = body.ativo !== undefined ? Boolean(body.ativo) : true;

        if (!nome) return NextResponse.json({ error: "Campo 'nome' é obrigatório" }, { status: 422 });

        const created = await prisma.location.create({
            data: {
                name: nome,
                description: descricao,
                capacity: Number.isFinite(capacidade) ? (capacidade as number) : undefined,
                ...(typeof duracaoMin !== "undefined" ? { durationMin: duracaoMin } : {}),
                isActive: ativo,
            },
            select: {
                id: true,
                name: true,
                description: true,
                capacity: true,
                durationMin: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ data: mapLocationToFrontend(created) }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/locais]", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const body = (await req.json()) ?? {};
        const id = String(body.id ?? "").trim();
        if (!id) return NextResponse.json({ error: "Campo 'id' é obrigatório" }, { status: 422 });

        const dataToUpdate: any = {};
        if (body.nome !== undefined) dataToUpdate.name = String(body.nome);
        if (body.descricao !== undefined)
            dataToUpdate.description = body.descricao === null ? null : String(body.descricao);
        if (body.capacidade !== undefined) {
            const cap = Number(body.capacidade);
            dataToUpdate.capacity = Number.isFinite(cap) ? cap : null;
        }
        if (body.duracaoMin !== undefined) {
            const d = Number(body.duracaoMin);
            dataToUpdate.durationMin = Number.isFinite(d) ? d : null;
        }
        if (body.ativo !== undefined) dataToUpdate.isActive = Boolean(body.ativo);

        const updated = await prisma.location.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                description: true,
                capacity: true,
                durationMin: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ data: mapLocationToFrontend(updated) }, { status: 200 });
    } catch (error: any) {
        console.error("[PATCH /api/locais]", error);
        if (error?.code === "P2025") return NextResponse.json({ error: "Local não encontrado" }, { status: 404 });
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Parâmetro 'id' é obrigatório" }, { status: 422 });

        await prisma.location.delete({ where: { id } });

        return NextResponse.json({ message: "Local removido com sucesso" }, { status: 200 });
    } catch (error: any) {
        console.error("[DELETE /api/locais]", error);
        if (error?.code === "P2025") return NextResponse.json({ error: "Local não encontrado" }, { status: 404 });
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
