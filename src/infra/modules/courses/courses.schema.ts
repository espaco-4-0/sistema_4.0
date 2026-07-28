import { CourseResource } from "@/src/generated/prisma/enums";
import { z } from "zod";

export const COURSE_RESOURCES = [
    "LESSONS",
    "PRESENCE",
    "CERTIFICATES",
    "GALLERY",
    "BLOG",
    "PROJECTS",
    "INVENTORY",
    "GAMIFICATION",
] as const satisfies readonly CourseResource[];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":");
    return Number(hours) * 60 + Number(minutes);
}

const timeSchema = z.string().trim().regex(TIME_PATTERN, "Horário deve estar no formato HH:mm");

const dateSchema = z.string().trim().date("Data inválida (use YYYY-MM-DD)");

export const courseScheduleSchema = z
    .object({
        diaSemana: z.number().int().min(0, "Dia da semana deve estar entre 0 e 6").max(6),
        horaInicio: timeSchema,
        horaFim: timeSchema,
        localId: z.string().trim().min(1).nullable().optional(),
    })
    .strict()
    .refine((slot) => timeToMinutes(slot.horaFim) > timeToMinutes(slot.horaInicio), {
        message: "Horário de término deve ser posterior ao de início",
        path: ["horaFim"],
    });

export const courseAgendaSchema = z
    .array(courseScheduleSchema)
    .max(50, "Máximo de 50 horários por curso")
    .superRefine((slots, ctx) => {
        const byDay = new Map<number, { start: number; end: number; index: number }[]>();

        slots.forEach((slot, index) => {
            const day = byDay.get(slot.diaSemana) ?? [];
            day.push({ start: timeToMinutes(slot.horaInicio), end: timeToMinutes(slot.horaFim), index });
            byDay.set(slot.diaSemana, day);
        });

        for (const daySlots of byDay.values()) {
            const ordered = [...daySlots].sort((a, b) => a.start - b.start);

            for (let i = 1; i < ordered.length; i++) {
                if (ordered[i].start < ordered[i - 1].end) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Horários do mesmo dia não podem se sobrepor",
                        path: [ordered[i].index],
                    });
                }
            }
        }
    });

export const courseAccessSchema = z
    .array(
        z
            .object({
                recurso: z.enum(COURSE_RESOURCES),
                liberado: z.boolean(),
            })
            .strict()
    )
    .max(COURSE_RESOURCES.length)
    .superRefine((entries, ctx) => {
        const seen = new Set<string>();

        entries.forEach((entry, index) => {
            if (seen.has(entry.recurso)) {
                ctx.addIssue({ code: "custom", message: "Recurso duplicado", path: [index, "recurso"] });
            }
            seen.add(entry.recurso);
        });
    });

const courseBaseSchema = z
    .object({
        titulo: z.string().trim().min(3).max(150),
        descricao: z.string().trim().min(10).max(2000).optional(),
        cargaHoraria: z.number().int().positive().optional(),
        dataInicio: dateSchema.nullable().optional(),
        dataFim: dateSchema.nullable().optional(),
        ativo: z.boolean().optional(),
        professorId: z.string().trim().min(1).optional(),
        agenda: courseAgendaSchema.optional(),
        acessos: courseAccessSchema.optional(),
    })
    .strict();

function hasValidPeriod(payload: { dataInicio?: string | null; dataFim?: string | null }) {
    if (!payload.dataInicio || !payload.dataFim) return true;
    return payload.dataFim >= payload.dataInicio;
}

const PERIOD_ISSUE = {
    message: "Data de término deve ser igual ou posterior à data de início",
    path: ["dataFim"],
};

export const createCourseSchema = courseBaseSchema.refine(hasValidPeriod, PERIOD_ISSUE);

export const patchCourseSchema = courseBaseSchema
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, {
        message: "Nenhum campo para atualizar",
    })
    .refine(hasValidPeriod, PERIOD_ISSUE);

export const replaceAgendaSchema = z.object({ agenda: courseAgendaSchema }).strict();

export const replaceAccessSchema = z.object({ acessos: courseAccessSchema }).strict();

export const subscribeCourseSchema = z.object({
    courseId: z.string().trim().min(1, "courseId é obrigatório"),
});

export type CourseSchedulePayload = z.infer<typeof courseScheduleSchema>;
export type CourseAccessPayload = z.infer<typeof courseAccessSchema>;
export type CreateCoursePayload = z.infer<typeof createCourseSchema>;
export type PatchCoursePayload = z.infer<typeof patchCourseSchema>;
export type SubscribeCoursePayload = z.infer<typeof subscribeCourseSchema>;
