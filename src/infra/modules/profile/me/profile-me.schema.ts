import { z } from "zod";

export const updateProfileSchema = z.object({
    nomeCompleto: z.string().min(3).optional(),
    email: z.string().email("Email invalido").optional(),
    avatarUrl: z.string().url("Avatar URL invalida").nullable().optional(),
    telefone: z.string().min(8).optional(),
    dataNascimento: z.string().date("Data invalida").optional(),
    raca: z.enum(["BRANCA", "PRETA", "PARDA", "AMARELA", "INDIGENA", "NAO_INFORMADA"]).optional(),
    educacao: z
        .enum([
            "FUNDAMENTAL_INCOMPLETO",
            "FUNDAMENTAL_COMPLETO",
            "MEDIO_CURSANDO",
            "MEDIO_COMPLETO",
            "SUPERIOR_CURSANDO",
            "SUPERIOR_COMPLETO",
        ])
        .optional(),
    ifalAfiliacao: z.enum(["ALUNO", "EX_ALUNO", "NAO_ALUNO", "SERVIDOR"]).optional(),
    deficiencia: z.string().trim().max(255).nullable().optional(),
    necessidadeEspecial: z.string().trim().max(500).nullable().optional(),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
