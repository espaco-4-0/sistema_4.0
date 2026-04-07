import { z } from "zod";

export const createCourseSchema = z
    .object({
        titulo: z.string().trim().min(3).max(150),
        descricao: z.string().trim().min(10).max(2000).optional(),
        cargaHoraria: z.number().int().positive().optional(),
        ativo: z.boolean().optional(),
        professorId: z.string().trim().min(1).optional(),
    })
    .strict();

export const patchCourseSchema = createCourseSchema.partial().refine((payload) => Object.keys(payload).length > 0, {
    message: "Nenhum campo para atualizar",
});

export const subscribeCourseSchema = z.object({
    courseId: z.string().trim().min(1, "courseId é obrigatório"),
});

export type CreateCoursePayload = z.infer<typeof createCourseSchema>;
export type PatchCoursePayload = z.infer<typeof patchCourseSchema>;
export type SubscribeCoursePayload = z.infer<typeof subscribeCourseSchema>;
