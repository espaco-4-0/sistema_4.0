import { z } from "zod";

export const patchUserSchema = z
    .object({
        nomeCompleto: z.string().min(6).optional(),
        email: z.string().email("Email invalido").optional(),
        senha: z.string().min(6).max(64).optional(),
        telefone: z.string().min(8).optional(),
        role: z.enum(["ADMIN", "PROFESSOR", "MONITOR", "PESQUISADOR", "VISITANTE"]).optional(),
        ativo: z.boolean().optional(),
        avatarUrl: z.string().url("Avatar URL invalida").nullable().optional(),
        deficiencia: z.string().trim().max(255).nullable().optional(),
        necessidadeEspecial: z.string().trim().max(500).nullable().optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, { message: "Nenhum campo para atualizar" });

export type PatchUserPayload = z.infer<typeof patchUserSchema>;
