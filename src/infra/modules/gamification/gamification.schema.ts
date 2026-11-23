import { z } from "zod";

import { BADGE_CRITERIA, GAMIFICATION_EVENTS } from "./rules.service";

export const saveRulesSchema = z.object({
    rules: z
        .array(
            z.object({
                event: z.enum(GAMIFICATION_EVENTS),
                xp: z.number().int().min(0, "XP não pode ser negativo").max(10_000),
                points: z.number().int().min(0, "Pontos não podem ser negativos").max(10_000),
                isActive: z.boolean(),
            })
        )
        .min(1, "Envie ao menos uma regra"),
});

const badgeBase = z.object({
    name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
    description: z.string().trim().max(500).nullable().optional(),
    points: z.number().int().min(0).max(10_000),
    criteria: z.enum(BADGE_CRITERIA),
    criteriaValue: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const createBadgeSchema = badgeBase.refine(
    (data) => data.criteria === "MANUAL" || (data.criteriaValue ?? 0) > 0,
    { message: "Critérios automáticos exigem um valor limite", path: ["criteriaValue"] }
);

export const patchBadgeSchema = badgeBase
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: "Nenhum campo para atualizar" });

export const grantBadgeSchema = z.object({
    userId: z.string().trim().min(1, "userId é obrigatório"),
    badgeId: z.string().trim().min(1, "badgeId é obrigatório"),
});

export type SaveRulesSchema = z.infer<typeof saveRulesSchema>;
export type CreateBadgeSchema = z.infer<typeof createBadgeSchema>;
