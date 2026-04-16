import { differenceInYears, parseISO } from "date-fns";
import { z } from "zod";

export const MIN_AGE = 15;

export const VALID_ROLES = ["ADMIN", "PROFESSOR", "MONITOR", "PESQUISADOR", "VISITANTE"] as const;

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
    raca: z.enum(["BRANCA", "PRETA", "PARDA", "AMARELA", "INDIGENA", "NAO_INFORMADA"]),
    educacao: z.enum([
        "FUNDAMENTAL_INCOMPLETO",
        "FUNDAMENTAL_COMPLETO",
        "MEDIO_CURSANDO",
        "MEDIO_COMPLETO",
        "SUPERIOR_CURSANDO",
        "SUPERIOR_COMPLETO",
    ]),
    ifalAfiliacao: z.enum(["ALUNO", "EX_ALUNO", "NAO_ALUNO", "SERVIDOR"]),
    deficiencia: z.string().trim().max(255).nullable().optional(),
    necessidadeEspecial: z.string().trim().max(500).nullable().optional(),
    role: z.enum(VALID_ROLES).optional(),
    ativo: z.boolean().optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
