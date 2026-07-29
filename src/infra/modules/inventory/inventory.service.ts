import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { CreateInventoryItemPayload, PatchInventoryItemPayload } from "./inventory.schema";

export const INVENTORY_INCLUDE = {
    responsible: { select: { id: true, fullName: true, email: true } },
    project: { select: { id: true, title: true } },
} satisfies Prisma.InventoryItemInclude;

export type InventoryItemWithRelations = Prisma.InventoryItemGetPayload<{ include: typeof INVENTORY_INCLUDE }>;

export interface ListInventoryFilter {
    category?: string | null;
    search?: string;
    active?: boolean;
    projectId?: string;
    responsibleId?: string;
}

export async function listInventoryItems(filter: ListInventoryFilter) {
    return prisma.inventoryItem.findMany({
        where: {
            ...(filter.category ? { category: filter.category as never } : {}),
            ...(filter.active !== undefined ? { isActive: filter.active } : {}),
            ...(filter.projectId ? { projectId: filter.projectId } : {}),
            ...(filter.responsibleId ? { responsibleId: filter.responsibleId } : {}),
            ...(filter.search ? { name: { contains: filter.search, mode: "insensitive" } } : {}),
        },
        include: INVENTORY_INCLUDE,
        orderBy: { name: "asc" },
    });
}

export async function getInventoryItem(id: string) {
    return prisma.inventoryItem.findUnique({ where: { id }, include: INVENTORY_INCLUDE });
}

export async function createInventoryItem(payload: CreateInventoryItemPayload) {
    return prisma.inventoryItem.create({
        data: {
            name: payload.nome,
            description: payload.descricao ?? null,
            category: payload.categoria ?? "OTHER",
            quantity: payload.quantidade ?? 1,
            unit: payload.unidade ?? null,
            location: payload.local ?? null,
            isActive: payload.ativo ?? true,
            responsibleId: payload.responsavelId ?? null,
            projectId: payload.projetoId ?? null,
        },
        include: INVENTORY_INCLUDE,
    });
}

export async function updateInventoryItem(id: string, payload: PatchInventoryItemPayload) {
    const data: Prisma.InventoryItemUpdateInput = {};

    if (payload.nome !== undefined) data.name = payload.nome;
    if (payload.descricao !== undefined) data.description = payload.descricao;
    if (payload.categoria !== undefined) data.category = payload.categoria;
    if (payload.quantidade !== undefined) data.quantity = payload.quantidade;
    if (payload.unidade !== undefined) data.unit = payload.unidade;
    if (payload.local !== undefined) data.location = payload.local;
    if (payload.ativo !== undefined) data.isActive = payload.ativo;

    if (payload.responsavelId !== undefined) {
        data.responsible = payload.responsavelId ? { connect: { id: payload.responsavelId } } : { disconnect: true };
    }

    if (payload.projetoId !== undefined) {
        data.project = payload.projetoId ? { connect: { id: payload.projetoId } } : { disconnect: true };
    }

    return prisma.inventoryItem.update({ where: { id }, data, include: INVENTORY_INCLUDE });
}

export async function deleteInventoryItem(id: string) {
    await prisma.inventoryItem.delete({ where: { id } });
}

/** Totais por categoria e itens em falta, para os cards da tela de recursos. */
export async function getInventorySummary() {
    const [byCategory, total, outOfStock] = await Promise.all([
        prisma.inventoryItem.groupBy({
            by: ["category"],
            where: { isActive: true },
            _count: { _all: true },
            _sum: { quantity: true },
        }),
        prisma.inventoryItem.count({ where: { isActive: true } }),
        prisma.inventoryItem.count({ where: { isActive: true, quantity: 0 } }),
    ]);

    return {
        total,
        outOfStock,
        byCategory: byCategory.map((row) => ({
            categoria: row.category,
            itens: row._count._all,
            quantidade: row._sum.quantity ?? 0,
        })),
    };
}
