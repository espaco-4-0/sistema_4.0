import { Education, IfalAffiliation, Race } from "@/src/generated/prisma/enums";
import { z } from "zod";

export const updateProfileSchema = z.object({
    nomeCompleto: z.string().min(3).optional(),
    email: z.string().email("Email invalido").optional(),
    avatarUrl: z.string().url("Avatar URL invalida").nullable().optional(),
    telefone: z.string().min(8).optional(),
    dataNascimento: z.string().date("Data invalida").optional(),
    raca: z.enum(Race).optional(),
    educacao: z.enum(Education).optional(),
    ifalAfiliacao: z.enum(IfalAffiliation).optional(),
    deficiencia: z.string().trim().max(255).nullable().optional(),
    necessidadeEspecial: z.string().trim().max(500).nullable().optional(),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
