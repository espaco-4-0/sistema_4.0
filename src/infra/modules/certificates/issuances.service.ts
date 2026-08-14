import { CertificateType } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/infra/data/prisma";

import type { CreateSignatureSchema, ListIssuancesSchema } from "./certifcates.schema";

export type CertificateMetrics = {
    totalGenerated: number;
    participationCount: number;
    completionCount: number;
    excellenceCount: number;
};

/**
 * Métricas do topo do painel. A contagem por tipo vem do template usado em cada
 * emissão, então `participation + completion + excellence === totalGenerated`.
 */
export async function getCertificateMetrics(): Promise<CertificateMetrics> {
    const [totalGenerated, porTipo] = await Promise.all([
        prisma.certificateEmission.count(),
        prisma.certificateEmission.groupBy({
            by: ["templateId"],
            _count: { _all: true },
        }),
    ]);

    const templateIds = porTipo.map((linha) => linha.templateId);

    const templates = await prisma.certificateTemplate.findMany({
        where: { id: { in: templateIds } },
        select: { id: true, type: true },
    });

    const tipoPorTemplate = new Map(templates.map((t) => [t.id, t.type]));
    const contagem: Record<CertificateType, number> = {
        PARTICIPATION: 0,
        COMPLETION: 0,
        EXCELLENCE: 0,
    };

    porTipo.forEach((linha) => {
        const tipo = tipoPorTemplate.get(linha.templateId);
        if (tipo) contagem[tipo] += linha._count._all;
    });

    return {
        totalGenerated,
        participationCount: contagem.PARTICIPATION,
        completionCount: contagem.COMPLETION,
        excellenceCount: contagem.EXCELLENCE,
    };
}

export async function getSignature(userId: string) {
    return prisma.certificateSignature.findUnique({ where: { userId } });
}

/** Cria ou atualiza a assinatura do usuário — é uma por responsável. */
export async function saveSignature(userId: string, data: CreateSignatureSchema, signatureImageUrl: string) {
    return prisma.certificateSignature.upsert({
        where: { userId },
        create: {
            userId,
            responsibleName: data.responsibleName,
            role: data.role,
            signatureImageUrl,
        },
        update: {
            responsibleName: data.responsibleName,
            role: data.role,
            signatureImageUrl,
        },
    });
}

export type IssuanceStatus = "COMPLETED" | "IN_PROGRESS" | "PENDING";

export type IssuanceRow = {
    id: string;
    studentId: string;
    studentName: string;
    courseName: string;
    status: IssuanceStatus;
    templateId: string | null;
    issuedAt: Date | null;
};

export type ListIssuancesResult = {
    data: IssuanceRow[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
};

/**
 * Cada linha é a dupla aluno × curso em que ele está matriculado:
 *  - COMPLETED  já tem certificado emitido
 *  - IN_PROGRESS matrícula ativa, sem emissão
 *  - PENDING     matrícula ainda não confirmada
 *
 * A paginação é feita sobre `Enrollment`, que é a tabela que define as linhas.
 */
export async function listIssuances(filter: ListIssuancesSchema): Promise<ListIssuancesResult> {
    const { page, limit, search, status } = filter;

    const searchWhere = search
        ? {
              OR: [
                  { user: { fullName: { contains: search, mode: "insensitive" as const } } },
                  { course: { title: { contains: search, mode: "insensitive" as const } } },
              ],
          }
        : {};

    // O status depende da existência de emissão, que não é filtrável direto no
    // Enrollment: buscamos o conjunto candidato e refinamos abaixo.
    const enrollments = await prisma.enrollment.findMany({
        where: searchWhere,
        include: {
            user: { select: { id: true, fullName: true } },
            course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const emissoes = await prisma.certificateEmission.findMany({
        where: { alunoId: { in: enrollments.map((e) => e.userId) } },
        select: { alunoId: true, course: true, templateId: true, emittedAt: true },
    });

    const emissaoPorAlunoCurso = new Map(emissoes.map((e) => [`${e.alunoId}::${e.course}`, e]));

    const todas: IssuanceRow[] = enrollments.map((enrollment) => {
        const emissao = emissaoPorAlunoCurso.get(`${enrollment.userId}::${enrollment.course.title}`);

        let situacao: IssuanceStatus;
        if (emissao) situacao = "COMPLETED";
        else if (enrollment.status === "PENDING") situacao = "PENDING";
        else situacao = "IN_PROGRESS";

        return {
            id: enrollment.id,
            studentId: enrollment.userId,
            studentName: enrollment.user.fullName,
            courseName: enrollment.course.title,
            status: situacao,
            templateId: emissao?.templateId ?? null,
            issuedAt: emissao?.emittedAt ?? null,
        };
    });

    const filtradas = status ? todas.filter((linha) => linha.status === status) : todas;

    const total = filtradas.length;
    const start = (page - 1) * limit;

    return {
        data: filtradas.slice(start, start + limit),
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
}

/** Resolve as matrículas informadas para os dados que a emissão precisa. */
export async function resolveIssuances(issuanceIds: string[]) {
    const enrollments = await prisma.enrollment.findMany({
        where: { id: { in: issuanceIds } },
        include: {
            user: { select: { id: true, fullName: true } },
            course: { select: { title: true } },
        },
    });

    return enrollments.map((enrollment) => ({
        issuanceId: enrollment.id,
        alunoId: enrollment.userId,
        alunoNome: enrollment.user.fullName,
        curso: enrollment.course.title,
    }));
}
