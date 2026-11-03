import { z } from "zod";

export const weekdayRuleItemSchema = z.object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    isAvailable: z.boolean(),
});

export const saveWeekdayRulesSchema = z.object({
    action: z.literal("saveWeekdayRules"),
    rules: z.array(weekdayRuleItemSchema).max(7),
});

export const saveDateRuleSchema = z.object({
    action: z.literal("saveDateRule"),
    dates: z.array(z.string()).min(1).max(366),
    isAvailable: z.boolean(),
    reason: z.string().nullable().optional(),
});

export const deleteDateRuleSchema = z.object({
    action: z.literal("deleteDateRule"),
    date: z.string().min(1),
});

export const visitPatchActionSchema = z.object({
    id: z.number().int().positive(),
    action: z.enum([
        "confirmEmail",
        "approveDocumentation",
        "markDocumentationIncomplete",
        "sendToIfal",
        "ifalApprove",
        "ifalDeny",
        "adminDeny",
    ]),
    reason: z.string().optional(),
});

export type WeekdayRuleItem = z.infer<typeof weekdayRuleItemSchema>;
export type SaveWeekdayRulesInput = z.infer<typeof saveWeekdayRulesSchema>;
export type SaveDateRuleInput = z.infer<typeof saveDateRuleSchema>;
export type DeleteDateRuleInput = z.infer<typeof deleteDateRuleSchema>;
export type VisitPatchActionInput = z.infer<typeof visitPatchActionSchema>;
