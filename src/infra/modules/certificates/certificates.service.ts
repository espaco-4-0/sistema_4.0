import { generatePdf } from "@/lib/pdf";

//Adicionar o Supabase "uploadToStorage"
import type {
    CertificateLayout,
    CreateTemplateSchema,
    EmitBatchCertificateSchema,
    EmitCertificateSchema,
    PatchTemplateSchema,
} from "./certifcates.schema";

type TemplateListItem = {
    id: string;
    titulo: string;
    tipo: string;
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
    return prisma.certificateTemplate.create({
        data: {
            ...data,
            criadoPor: professorId,
        },
    });
}

export async function listTemplates(professorId: string): Promise<TemplateListItem[]> {
    return prisma.certificateTemplate.findMany({
        where: { criadoPor: professorId, status: "ATIVO" },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            titulo: true,
            tipo: true,
            layout: true,
            updatedAt: true,
            _count: { select: { emissoes: true } },
        },
    });
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
    if (!isAdmin && template.criadoPor !== professorId) {
        throw new Error("Sem permissão para editar este template");
    }

    return prisma.certificateTemplate.update({
        where: { id: templateId },
        data,
    });
}

export async function deleteTemplate(templateId: string) {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: templateId },
    });

    if (!template) throw new Error("Template não encontrado");

    return prisma.certificateTemplate.update({
        where: { id: templateId },
        data: { status: "INATIVO" },
    });
}

export async function emitCertificate(data: EmitCertificateSchema, emitidoPor: string) {
    const template = await prisma.certificateTemplate.findUnique({
        where: { id: data.templateId },
    });

    if (!template) throw new Error("Template não encontrado");
    if (template.status === "INATIVO") throw new Error("Template inativo");

    const aluno = await prisma.user.findUnique({
        where: { id: data.alunoId },
        select: { id: true, nome: true, email: true },
    });

    if (!aluno) throw new Error("Aluno não encontrado");

    const layout = template.layout as CertificateLayout;

    const pdfBuffer = await generatePdf({
        titulo: template.titulo,
        descricao: template.descricao,
        alunoNome: aluno.nome,
        curso: data.curso,
        cargaHoraria: template.cargaHoraria ?? undefined,
        validadeAte: data.validadeAte,
        emitidoEm: new Date(),
        layout,
    });

    const storagePath = `certificados/${data.templateId}/${aluno.id}.pdf`;
    const arquivoUrl = await uploadToStorage(storagePath, pdfBuffer);

    return prisma.certificateEmission.upsert({
        where: {
            templateId_alunoId: {
                templateId: data.templateId,
                alunoId: aluno.id,
            },
        },
        update: {
            arquivoUrl,
            emitidoEm: new Date(),
            emitidoPor,
            curso: data.curso,
            validadeAte: data.validadeAte,
        },
        create: {
            templateId: data.templateId,
            alunoId: aluno.id,
            emitidoPor,
            curso: data.curso,
            arquivoUrl,
            validadeAte: data.validadeAte,
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
    if (template.status === "INATIVO") throw new Error("Template inativo");

    const alunos = await prisma.user.findMany({
        where: { id: { in: data.alunoIds }, role: "aluno" },
        select: { id: true, nome: true },
    });

    if (alunos.length === 0) {
        throw new Error("Nenhum aluno válido encontrado");
    }

    const layout = template.layout as CertificateLayout;

    const resultados = await Promise.allSettled(
        alunos.map(async (aluno) => {
            const pdfBuffer = await generatePdf({
                titulo: template.titulo,
                descricao: template.descricao,
                alunoNome: aluno.nome,
                curso: data.curso,
                cargaHoraria: template.cargaHoraria ?? undefined,
                validadeAte: data.validadeAte,
                emitidoEm: new Date(),
                layout,
            });

            const storagePath = `certificados/${data.templateId}/${aluno.id}.pdf`;
            const arquivoUrl = await uploadToStorage(storagePath, pdfBuffer);

            await prisma.certificateEmission.upsert({
                where: {
                    templateId_alunoId: {
                        templateId: data.templateId,
                        alunoId: aluno.id,
                    },
                },
                update: {
                    arquivoUrl,
                    emitidoEm: new Date(),
                    emitidoPor,
                    curso: data.curso,
                    validadeAte: data.validadeAte,
                },
                create: {
                    templateId: data.templateId,
                    alunoId: aluno.id,
                    emitidoPor,
                    curso: data.curso,
                    arquivoUrl,
                    validadeAte: data.validadeAte,
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

    const signedUrl = await getSignedUrl(emission.arquivoUrl, {
        expiresIn: 60 * 15,
    });

    await prisma.certificateEmission.update({
        where: { id: emission.id },
        data: {
            ultimoDownload: new Date(),
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
            template: {
                select: {
                    titulo: true,
                    tipo: true,
                    cargaHoraria: true,
                },
            },
        },
        orderBy: { emitidoEm: "desc" },
    });
}
