import { prisma } from "@/src/infra/data/prisma";
import { INVENTORY_CATEGORIES, createInventoryItemSchema } from "@/src/infra/modules/inventory/inventory.schema";
import {
    createInventoryItem,
    getInventorySummary,
    listInventoryItems,
} from "@/src/infra/modules/inventory/inventory.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

const MANAGE_ROLES = ["ADMIN", "PROFESSOR"];

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get("categoria")?.trim();

        if (category && !INVENTORY_CATEGORIES.includes(category as never)) {
            return NextResponse.json({ message: "Categoria inválida" }, { status: 400 });
        }

        const activeParam = searchParams.get("ativo")?.trim().toLowerCase();
        if (activeParam && activeParam !== "true" && activeParam !== "false") {
            return NextResponse.json({ message: "Parâmetro 'ativo' inválido" }, { status: 400 });
        }

        const [items, summary] = await Promise.all([
            listInventoryItems({
                category,
                active: activeParam ? activeParam === "true" : undefined,
                search: searchParams.get("q")?.trim() || undefined,
                projectId: searchParams.get("projetoId")?.trim() || undefined,
                responsibleId: searchParams.get("responsavelId")?.trim() || undefined,
            }),
            getInventorySummary(),
        ]);

        return NextResponse.json({ data: items, summary }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/inventory]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (!MANAGE_ROLES.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para cadastrar itens" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = createInventoryItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        if (parsed.data.responsavelId) {
            const responsible = await prisma.user.findUnique({
                where: { id: parsed.data.responsavelId },
                select: { id: true, isActive: true },
            });

            if (!responsible || !responsible.isActive) {
                return NextResponse.json({ message: "Responsável não encontrado" }, { status: 404 });
            }
        }

        if (parsed.data.projetoId) {
            const project = await prisma.project.findUnique({
                where: { id: parsed.data.projetoId },
                select: { id: true },
            });

            if (!project) {
                return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
            }
        }

        const item = await createInventoryItem(parsed.data);

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("[POST /api/inventory]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
