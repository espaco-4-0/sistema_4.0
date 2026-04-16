import { z } from "zod";

export const templateLayoutSchema = z.object({
    corFundo: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida")
        .default("#FFFFFF"),
    corTitulo: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .default("#1A1A1A"),
    corNome: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .default("#B89614"),
    corTexto: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .default("#4A4A4A"),
    corBorda: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .default("#B89614"),
    logoUrl: z.string().url().optional(),
    assinaturaUrl: z.string().url().optional(),
    assinante: z.string().max(100).optional(),
    cargo: z.string().max(100).optional(),
});

export const createTemplateSchema = z.object({
    titulo: z.string().trim().min(3).max(150),
    descricao: z.string().trim().min(10).max(500),
    tipo: z.enum(["Participação", "Conclusão", "Excelência"]),
    cargaHoraria: z.coerce.number().int().positive().optional(),
    layout: templateLayoutSchema,
});

export const patchTemplateSchema = createTemplateSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar",
});

export const emitCertificateSchema = z.object({
    templateId: z.string().uuid("ID do template inválido"),
    alunoId: z.string().uuid("ID do aluno inválido"),
    curso: z.string().trim().min(2).max(100),
    validadeAte: z.coerce
        .date()
        .refine((d) => d.getTime() > Date.now(), {
            message: "A data deve ser futura",
        })
        .optional(),
});

export const emitBatchCertificateSchema = z.object({
    templateId: z.string().uuid(),
    curso: z.string().trim().min(2).max(100),
    alunoIds: z.array(z.string().uuid()).min(1, "Informe ao menos um aluno").max(100, "Limite de 100 alunos por lote"),
    validadeAte: z.coerce
        .date()
        .refine((d) => d.getTime() > Date.now(), {
            message: "A data deve ser futura",
        })
        .optional(),
});

export type CertificateLayout = z.infer<typeof templateLayoutSchema>;
export type CreateTemplateSchema = z.infer<typeof createTemplateSchema>;
export type PatchTemplateSchema = z.infer<typeof patchTemplateSchema>;
export type EmitCertificateSchema = z.infer<typeof emitCertificateSchema>;
export type EmitBatchCertificateSchema = z.infer<typeof emitBatchCertificateSchema>;
