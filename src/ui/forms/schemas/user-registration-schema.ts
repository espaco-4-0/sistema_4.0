import * as z from "zod";

export const raceOptions = ["branca", "preta", "parda", "amarela", "indigena", "nao informada"] as const;

export const DEFICIENCY_OPTIONS = [
    "Nenhuma",
    "Deficiência física",
    "Deficiência auditiva",
    "Deficiência visual",
    "Deficiência intelectual",
    "Deficiência múltipla",
    "Outro",
] as const;

export const EDUCATION_OPTIONS = [
    "fundamental incompleto",
    "fundamental completo",
    "medio cursando",
    "medio completo",
    "superior cursando",
    "superior completo",
] as const;

export const IFAL_AFFILIATION_OPTIONS = ["aluno", "ex-aluno", "nao-aluno"] as const;

export const userRegistrationSchema = z
    .object({
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
            .max(16, "A senha deve ter no máximo 16 caracteres")
            .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
            .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
            .regex(/\d/, "Deve conter pelo menos um número")
            .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial (@, #, $, etc.)"),

        confirmPassword: z.string(),

        dateOfBirth: z
            .string()
            .refine((val) => !Number.isNaN(Date.parse(val)), "Data inválida")
            .refine((val) => {
                const birthDate = new Date(val);
                const today = new Date();
                return birthDate < today;
            }, "A data de nascimento não pode ser no futuro"),

        whatsapp: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, "Formato inválido. Use (00) 00000-0000"),

        race: z.enum(raceOptions, {
            message: "Selecione uma opção válida",
        }),

        deficiency: z.enum(DEFICIENCY_OPTIONS, {
            message: "Selecione uma opção válida",
        }),

        deficiencyNeeds: z.string().trim().optional(),

        deficiencyDetail: z.string().trim().optional(),

        education: z.enum(EDUCATION_OPTIONS, {
            message: "Selecione uma opção válida",
        }),

        ifal_afiliation: z.enum(IFAL_AFFILIATION_OPTIONS, {
            message: "Selecione uma opção válida",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .refine(
        (data) => {
            if (data.deficiency !== "Nenhuma") {
                return !!data.deficiencyNeeds && data.deficiencyNeeds.trim().length > 0;
            }
            return true;
        },
        {
            message: "Por favor, informe as necessidades especiais",
            path: ["deficiencyNeeds"],
        }
    )
    .refine(
        (data) => {
            if (data.deficiency === "Outro") {
                return !!data.deficiencyDetail && data.deficiencyDetail.length > 0;
            }
            return true;
        },
        {
            message: "Por favor, especifique qual é a deficiência",
            path: ["deficiencyDetail"],
        }
    );

export type userRegistrationData = z.infer<typeof userRegistrationSchema>;
