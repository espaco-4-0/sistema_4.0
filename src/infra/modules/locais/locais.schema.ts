import { z } from "zod";

export const listLocaisQuerySchema = z.object({
    includeInactive: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
    q: z.preprocess(
        (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
        z.string().trim().min(1).optional()
    ),
});

export const createLocalSchema = z.object({
    nome: z.preprocess((val) => String(val ?? "").trim(), z.string().min(1, "Campo 'nome' é obrigatório")),
    descricao: z.preprocess(
        (val) => (val === undefined || val === null || val === "" ? null : String(val)),
        z.string().nullable().optional()
    ),
    capacidade: z.preprocess(
        (val) => (val === undefined || val === null || val === "" ? undefined : Number(val)),
        z.number().finite().optional()
    ),
    duracaoMin: z.preprocess(
        (val) => (val === undefined ? undefined : Number(val) || null),
        z.number().finite().nullable().optional()
    ),
    ativo: z.preprocess((val) => (val === undefined ? true : Boolean(val)), z.boolean().default(true)),
});

export const updateLocalSchema = z.object({
    id: z.preprocess((val) => String(val ?? "").trim(), z.string().min(1, "Campo 'id' é obrigatório")),
    nome: z.preprocess((val) => (val === undefined ? undefined : String(val)), z.string().optional()),
    descricao: z.preprocess(
        (val) => (val === undefined ? undefined : val === null ? null : String(val)),
        z.string().nullable().optional()
    ),
    capacidade: z.preprocess((val) => {
        if (val === undefined) return undefined;
        const n = Number(val);
        return Number.isFinite(n) ? n : null;
    }, z.number().finite().nullable().optional()),
    duracaoMin: z.preprocess((val) => {
        if (val === undefined) return undefined;
        const n = Number(val);
        return Number.isFinite(n) ? n : null;
    }, z.number().finite().nullable().optional()),
    ativo: z.preprocess((val) => (val === undefined ? undefined : Boolean(val)), z.boolean().optional()),
});

export const deleteLocalQuerySchema = z.object({
    id: z.preprocess((val) => String(val ?? "").trim(), z.string().min(1, "Parâmetro 'id' é obrigatório")),
});

export type ListLocaisQueryInput = z.infer<typeof listLocaisQuerySchema>;
export type CreateLocalInput = z.infer<typeof createLocalSchema>;
export type UpdateLocalInput = z.infer<typeof updateLocalSchema>;
export type DeleteLocalQueryInput = z.infer<typeof deleteLocalQuerySchema>;
