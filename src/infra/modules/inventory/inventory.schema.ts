import { InventoryCategory } from "@/src/generated/prisma/enums";
import { z } from "zod";

export const INVENTORY_CATEGORIES = ["EQUIPMENT", "MATERIAL", "SOFTWARE", "OTHER"] as const satisfies readonly InventoryCategory[];

const inventoryBaseSchema = z
    .object({
        nome: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(150),
        descricao: z.string().trim().max(2000).nullable().optional(),
        categoria: z.enum(INVENTORY_CATEGORIES).optional(),
        quantidade: z.number().int().min(0, "Quantidade não pode ser negativa").optional(),
        unidade: z.string().trim().max(20).nullable().optional(),
        local: z.string().trim().max(150).nullable().optional(),
        ativo: z.boolean().optional(),
        responsavelId: z.string().trim().min(1).nullable().optional(),
        projetoId: z.string().trim().min(1).nullable().optional(),
    })
    .strict();

export const createInventoryItemSchema = inventoryBaseSchema;

export const patchInventoryItemSchema = inventoryBaseSchema
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, { message: "Nenhum campo para atualizar" });

export type CreateInventoryItemPayload = z.infer<typeof createInventoryItemSchema>;
export type PatchInventoryItemPayload = z.infer<typeof patchInventoryItemSchema>;
