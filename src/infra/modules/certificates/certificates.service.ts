import { generatePdf } from "@/lib/pdf";
import { prisma } from "@/src/infra/data/prisma";
import { storage } from "@/src/lib/storage";

import type {
    CertificateLayout,
    CreateTemplateSchema,
    EmitBatchCertificateSchema,
    EmitCertificateSchema,
    PatchTemplateSchema,
} from "./certifcates.schema";

type TemplateListItem = {
    id: string;
    title: string;
    type: string;
    layout: CertificateLayout;
    updatedAt: Date;
    _count: { emissoes: number };
};

type BatchResult = {
    total: number;
    gerados: number;
    falhas: number;
};

type DownloadResponse = {
    url: string;
    expiraEm: Date;
};

export async function createTemplate(data: CreateTemplateSchema, professorId: string) {
    const { titulo, descricao, cargaHoraria, layout, tipo } = data;
    return prisma.certificateTemplate.create({
        data: {
            title: titulo,
            description: descricao,
            workload: cargaHoraria,
            layout: layout as any,
            type: tipo,
            emittedBy: professorId,
        },
    });
}

export async function listTemplates(professorId: string): Promise<TemplateListItem[]> {
    const templates = await prisma.certificateTemplate.findMany({
        where: { emittedBy: professorId, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            type: true,
            layout: true,
            updatedAt: true,
            _count: { select: { emissoes: true } },
        },
    });
    return templates as unknown as TemplateListItem[];
}

export async function updateTemplate(
    templateId: string,
    professorId: string,
    data: PatchTemplateSchema,
    isAdmin = false
) {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
    });

    if (!template) throw new Error("Template não encontrado");
    if (!isAdmin && template.emittedBy !== professorId) {
        throw new Error("Sem permissão para editar este template");
    }

    const updateData: any = {};
    if (data.titulo !== undefined) updateData.title = data.titulo;
    if (data.descricao !== undefined) updateData.description = data.descricao;
    if (data.cargaHoraria !== undefined) updateData.workload = data.cargaHoraria;
    if (data.layout !== undefined) updateData.layout = data.layout;
    if (data.tipo !== undefined) updateData.type = data.tipo;

    return prisma.certificateTemplate.update({
        where: { id: templateId },
        data: updateData,
    });
}

export async function deleteTemplate(templateId: string) {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
    });

    if (!template) throw new Error("Template não encontrado");

    return prisma.certificateTemplate.update({
        where: { id: templateId },
        data: { status: "INACTIVE" },
    });
}

export async function emitCertificate(data: EmitCertificateSchema, emitidoPor: string) {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: data.templateId },
    });

    if (!template) throw new Error("Template não encontrado");
    if (template.status === "INACTIVE") throw new Error("Template inativo");

    const aluno = await prisma.user.findUnique({
        where: { id: data.alunoId },
        select: { id: true, fullName: true, email: true },
    });

    if (!aluno) throw new Error("Aluno não encontrado");

    const layout = template.layout as unknown as CertificateLayout;

    const pdfBuffer = await generatePdf({
        titulo: template.title,
        descricao: template.description,
        alunoNome: aluno.fullName,
        curso: data.curso,
        cargaHoraria: template.workload ?? undefined,
        validadeAte: data.validadeAte,
        emitidoEm: new Date(),
        layout,
    });

    const storagePath = `certificados/${data.templateId}/${aluno.id}.pdf`;
    const uploadResult = await storage.uploadPrivate(pdfBuffer, storagePath, "application/pdf");
    const fileUrl = uploadResult.path;

    return prisma.certificateEmission.upsert({
        where: {
            templateId_alunoId: {
                templateId: data.templateId,
                alunoId: aluno.id,
            },
        },
        update: {
            fileUrl,
            emittedAt: new Date(),
            emittedBy: emitidoPor,
            course: data.curso,
            validUntil: data.validadeAte,
        },
        create: {
            templateId: data.templateId,
            alunoId: aluno.id,
            emittedBy: emitidoPor,
            course: data.curso,
            fileUrl,
            validUntil: data.validadeAte,
        },
    });
}

export async function emitBatchCertificates(
    data: EmitBatchCertificateSchema,
    emitidoPor: string
): Promise<BatchResult> {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: data.templateId },
    });

    if (!template) throw new Error("Template não encontrado");
    if (template.status === "INACTIVE") throw new Error("Template inativo");

    const alunos = await prisma.user.findMany({
        where: { id: { in: data.alunoIds }, role: "VISITOR" },
        select: { id: true, fullName: true },
    });

    if (alunos.length === 0) {
        throw new Error("Nenhum aluno válido encontrado");
    }

    const layout = template.layout as unknown as CertificateLayout;

    const resultados = await Promise.allSettled(
        alunos.map(async (aluno) => {
            const pdfBuffer = await generatePdf({
                titulo: template.title,
                descricao: template.description,
                alunoNome: aluno.fullName,
                curso: data.curso,
                cargaHoraria: template.workload ?? undefined,
                validadeAte: data.validadeAte,
                emitidoEm: new Date(),
                layout,
            });

            const storagePath = `certificados/${data.templateId}/${aluno.id}.pdf`;
            const uploadResult = await storage.uploadPrivate(pdfBuffer, storagePath, "application/pdf");
            const fileUrl = uploadResult.path;

            await prisma.certificateEmission.upsert({
                where: {
                    templateId_alunoId: {
                        templateId: data.templateId,
                        alunoId: aluno.id,
                    },
                },
                update: {
                    fileUrl,
                    emittedAt: new Date(),
                    emittedBy: emitidoPor,
                    course: data.curso,
                    validUntil: data.validadeAte,
                },
                create: {
                    templateId: data.templateId,
                    alunoId: aluno.id,
                    emittedBy: emitidoPor,
                    course: data.curso,
                    fileUrl,
                    validUntil: data.validadeAte,
                },
            });

            return { alunoId: aluno.id, status: "ok" };
        })
    );

    const sucessos = resultados.filter((r) => r.status === "fulfilled");
    const falhas = resultados.filter((r) => r.status === "rejected");

    return {
        total: alunos.length,
        gerados: sucessos.length,
        falhas: falhas.length,
    };
}

export async function downloadCertificate(templateId: string, alunoId: string): Promise<DownloadResponse> {
    const emission = await prisma.certificateEmission.findUnique({
        where: { templateId_alunoId: { templateId, alunoId } },
    });

    if (!emission) {
        throw new Error("Certificado ainda não foi emitido para este aluno");
    }

    const signedUrl = await storage.getPrivateUrl(emission.fileUrl, 60 * 15);

    await prisma.certificateEmission.update({
        where: { id: emission.id },
        data: {
            lastDownloadedAt: new Date(),
            totalDownloads: { increment: 1 },
        },
    });

    return {
        url: signedUrl,
        expiraEm: new Date(Date.now() + 60 * 15 * 1000),
    };
}

export async function listEmissionsForStudent(alunoId: string) {
    return prisma.certificateEmission.findMany({
        where: { alunoId },
        include: {
            certificate: {
                select: {
                    title: true,
                    type: true,
                    workload: true,
                },
            },
        },
        orderBy: { emittedAt: "desc" },
    });
}
