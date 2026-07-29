import { ProjectStatus, ProjectType, TaskStatus } from "@/src/generated/prisma/enums";
import { z } from "zod";

export const PROJECT_CATEGORIES = ["EXTENSION", "RESEARCH"] as const satisfies readonly ProjectType[];

export const PROJECT_STATUSES = ["IN_PROGRESS", "COMPLETED", "CANCELLED"] as const satisfies readonly ProjectStatus[];

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const satisfies readonly TaskStatus[];

const memberSchema = z
    .object({
        userId: z.string().trim().min(1, "userId é obrigatório"),
        papel: z.string().trim().max(80).nullable().optional(),
    })
    .strict();

const membersSchema = z
    .array(memberSchema)
    .max(30, "Máximo de 30 integrantes")
    .superRefine((members, ctx) => {
        const seen = new Set<string>();

        members.forEach((member, index) => {
            if (seen.has(member.userId)) {
                ctx.addIssue({ code: "custom", message: "Integrante duplicado", path: [index, "userId"] });
            }
            seen.add(member.userId);
        });
    });

export const createProjectRequestSchema = z
    .object({
        titulo: z.string().trim().min(5, "Título deve ter no mínimo 5 caracteres").max(150),
        descricao: z.string().trim().min(20, "Descrição deve ter no mínimo 20 caracteres").max(5000),
        objetivo: z.string().trim().min(20, "Objetivo deve ter no mínimo 20 caracteres").max(5000),
        categoria: z.enum(PROJECT_CATEGORIES),
        integrantes: membersSchema.optional(),
    })
    .strict();

export const patchProjectRequestSchema = createProjectRequestSchema
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, { message: "Nenhum campo para atualizar" });

export const approveProjectRequestSchema = z
    .object({
        comment: z.string().trim().max(2000).optional(),
    })
    .strict();

export const rejectProjectRequestSchema = z
    .object({
        reason: z.string().trim().min(10, "Motivo deve ter no mínimo 10 caracteres").max(2000),
        observacoes: z.string().trim().max(2000).optional(),
    })
    .strict();

export const patchProjectSchema = z
    .object({
        titulo: z.string().trim().min(5).max(150).optional(),
        descricao: z.string().trim().max(5000).nullable().optional(),
        tipo: z.enum(PROJECT_CATEGORIES).optional(),
        status: z.enum(PROJECT_STATUSES).optional(),
        dataInicio: z.string().trim().date("Data inválida (use YYYY-MM-DD)").nullable().optional(),
        dataFim: z.string().trim().date("Data inválida (use YYYY-MM-DD)").nullable().optional(),
        liderId: z.string().trim().min(1).optional(),
        integrantes: membersSchema.optional(),
    })
    .strict()
    .refine((payload) => Object.keys(payload).length > 0, { message: "Nenhum campo para atualizar" })
    .refine((payload) => !payload.dataInicio || !payload.dataFim || payload.dataFim >= payload.dataInicio, {
        message: "Data de término deve ser igual ou posterior à data de início",
        path: ["dataFim"],
    });

export const createTaskSchema = z
    .object({
        titulo: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres").max(150),
        descricao: z.string().trim().max(5000).nullable().optional(),
        status: z.enum(TASK_STATUSES).optional(),
        progresso: z.number().int().min(0).max(100).optional(),
        prazo: z.string().trim().datetime({ offset: true }).nullable().optional(),
        responsavelId: z.string().trim().min(1).nullable().optional(),
    })
    .strict();

export const patchTaskSchema = createTaskSchema
    .partial()
    .refine((payload) => Object.keys(payload).length > 0, { message: "Nenhum campo para atualizar" });

export const taskStatusSchema = z.object({ status: z.enum(TASK_STATUSES) }).strict();

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FILE_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export type CreateProjectRequestPayload = z.infer<typeof createProjectRequestSchema>;
export type PatchProjectRequestPayload = z.infer<typeof patchProjectRequestSchema>;
export type RejectProjectRequestPayload = z.infer<typeof rejectProjectRequestSchema>;
export type PatchProjectPayload = z.infer<typeof patchProjectSchema>;
export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
export type PatchTaskPayload = z.infer<typeof patchTaskSchema>;
