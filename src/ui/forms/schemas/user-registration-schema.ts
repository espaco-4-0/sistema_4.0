import { Education, IfalAfiliation, Race } from "@/src/generated/prisma/enums";
import { differenceInYears } from "date-fns";
import * as z from "zod";

export enum DeficiencyOption {
    Nenhuma = "Nenhuma",
    Fisica = "Deficiência física",
    Auditiva = "Deficiência auditiva",
    Visual = "Deficiência visual",
    Intelectual = "Deficiência intelectual",
    Multipla = "Deficiência múltipla",
    Outro = "Outro",
}

export const userRegistrationSchema = z.object({
    completeName: z
        .string()
        .min(6, "O nome completo deve ter no mínimo 6 caracteres")
        .refine((value) => {
            const nameParts = value.split(/\s+/);
            return nameParts.length >= 2 && nameParts.every((part) => part.length >= 2);
        }, "Por favor, insira o nome e sobrenome"),
    email: z.email("Por favor, insira um endereço de e-mail válido"),
    password: z
        .string()
        .min(6, "A senha deve ter no mínimo 6 caracteres")
        .max(32, "A senha deve ter no máximo 32 caracteres")
        .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
        .regex(/\d/, "Deve conter pelo menos um número")
        .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial (@, #, $, etc.)"),
    dateOfBirth: z.string().refine((val) => {
        const age = differenceInYears(new Date(), new Date(val));
        return Number.isFinite(age) && age >= 16 && age <= 120;
    }, "Data inválida ou idade fora do intervalo permitido (16–120 anos)"),
    telephone: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, "Formato inválido. Use (00) 00000-0000"),
    race: z.enum(Race, { message: "Selecione uma opção válida" }),
    deficiency: z.string().trim().max(255).optional(),
    deficiencyNeeds: z.string().trim().max(500).optional(),
    education: z.enum(Education, { message: "Selecione uma opção válida" }),
    ifal_afiliation: z.enum(IfalAfiliation, { message: "Selecione uma opção válida" }),
});

export const userRegistrationFrontSchema = userRegistrationSchema
    .extend({
        confirmPassword: z.string().min(1, "Confirme a senha"),
        deficiency: z.enum(DeficiencyOption, "Selecione uma opção válida"),
        otherDeficiency: z.string().trim().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .refine(
        (data) => {
            if (data.deficiency === "Outro") {
                return !!data.otherDeficiency && data.otherDeficiency.trim().length > 0;
            }
            return true;
        },
        {
            message: "Por favor, especifique a deficiência",
            path: ["otherDeficiency"],
        }
    );

export type UserRegistrationFrontData = z.infer<typeof userRegistrationFrontSchema>;
