import { Education, IfalAffiliation, Race, UserRole } from "@/src/generated/prisma/enums";
import { differenceInYears, parseISO } from "date-fns";
import { z } from "zod";

export const MIN_AGE = 15;

export const VALID_ROLES = ["ADMIN", "PROFESSOR", "MONITOR", "RESEARCHER", "VISITOR"] as const;

export type ValidRole = (typeof VALID_ROLES)[number];

export const createUserSchema = z.object({
    nomeCompleto: z.string().min(6, "Nome completo deve ter no mínimo 6 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(64, "Senha deve ter no máximo 64 caracteres"),
    dataNascimento: z
        .string()
        .date("Data de nascimento inválida")
        .refine((val) => {
            const age = differenceInYears(new Date(), parseISO(val));
            return age >= MIN_AGE;
        }, `Idade mínima de ${MIN_AGE} anos`),
    telefone: z.string().min(8, "Telefone inválido"),
    raca: z.enum(Race),
    educacao: z.enum(Education),
    ifalAfiliacao: z.enum(IfalAffiliation),
    deficiencia: z.string().trim().max(255).nullable().optional(),
    necessidadeEspecial: z.string().trim().max(500).nullable().optional(),
    role: z.enum(VALID_ROLES).optional(),
    ativo: z.boolean().optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
