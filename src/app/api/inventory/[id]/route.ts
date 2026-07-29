import { patchInventoryItemSchema } from "@/src/infra/modules/inventory/inventory.schema";
import {
    deleteInventoryItem,
    getInventoryItem,
    updateInventoryItem,
} from "@/src/infra/modules/inventory/inventory.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

const MANAGE_ROLES = ["ADMIN", "PROFESSOR"];

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const item = await getInventoryItem(id);
        if (!item) {
            return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error("[GET /api/inventory/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (!MANAGE_ROLES.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para editar itens" }, { status: 403 });
        }

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const existing = await getInventoryItem(id);
        if (!existing) {
            return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = patchInventoryItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updated = await updateInventoryItem(id, parsed.data);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/inventory/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem excluir itens" }, { status: 403 });
        }

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const existing = await getInventoryItem(id);
        if (!existing) {
            return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
        }

        await deleteInventoryItem(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/inventory/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
