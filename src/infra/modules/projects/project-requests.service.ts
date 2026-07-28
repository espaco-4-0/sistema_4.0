import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { CreateProjectRequestPayload, PatchProjectRequestPayload } from "./projects.schema";

export const PROJECT_REQUEST_INCLUDE = {
    createdBy: { select: { id: true, fullName: true, email: true } },
    reviewedBy: { select: { id: true, fullName: true, email: true } },
    members: {
        include: { user: { select: { id: true, fullName: true, email: true } } },
    },
    attachments: {
        orderBy: { createdAt: "asc" },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
    },
    project: { select: { id: true, title: true, status: true } },
} satisfies Prisma.ProjectRequestInclude;

export type ProjectRequestWithRelations = Prisma.ProjectRequestGetPayload<{
    include: typeof PROJECT_REQUEST_INCLUDE;
}>;

export interface ListProjectRequestsFilter {
    status?: string | null;
    createdById?: string;
}

export async function listProjectRequests(filter: ListProjectRequestsFilter) {
    return prisma.projectRequest.findMany({
        where: {
            ...(filter.status ? { status: filter.status as never } : {}),
            ...(filter.createdById ? { createdById: filter.createdById } : {}),
        },
        include: PROJECT_REQUEST_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
}

export async function getProjectRequest(id: string) {
    return prisma.projectRequest.findUnique({ where: { id }, include: PROJECT_REQUEST_INCLUDE });
}

/** Retorna os ids que não correspondem a usuários ativos. */
export async function findInvalidUserIds(userIds: string[]): Promise<string[]> {
    const unique = [...new Set(userIds)];
    if (unique.length === 0) return [];

    const found = await prisma.user.findMany({
        where: { id: { in: unique }, isActive: true },
        select: { id: true },
    });

    const foundIds = new Set(found.map((user) => user.id));

    return unique.filter((id) => !foundIds.has(id));
}

export async function createProjectRequest(payload: CreateProjectRequestPayload, createdById: string) {
    return prisma.projectRequest.create({
        data: {
            title: payload.titulo,
            description: payload.descricao,
            objective: payload.objetivo,
            category: payload.categoria,
            createdById,
            ...(payload.integrantes && {
                members: {
                    create: payload.integrantes.map((member) => ({
                        userId: member.userId,
                        role: member.papel ?? null,
                    })),
                },
            }),
        },
        include: PROJECT_REQUEST_INCLUDE,
    });
}

export async function updateProjectRequest(id: string, payload: PatchProjectRequestPayload) {
    const data: Prisma.ProjectRequestUpdateInput = {
        status: "PENDING",
        rejectionReason: null,
        reviewNotes: null,
        reviewedAt: null,
        reviewedBy: { disconnect: true },
    };

    if (payload.titulo !== undefined) data.title = payload.titulo;
    if (payload.descricao !== undefined) data.description = payload.descricao;
    if (payload.objetivo !== undefined) data.objective = payload.objetivo;
    if (payload.categoria !== undefined) data.category = payload.categoria;

    return prisma.$transaction(async (tx) => {
        if (payload.integrantes !== undefined) {
            await tx.projectRequestMember.deleteMany({ where: { requestId: id } });
            await tx.projectRequestMember.createMany({
                data: payload.integrantes.map((member) => ({
                    requestId: id,
                    userId: member.userId,
                    role: member.papel ?? null,
                })),
            });
        }

        return tx.projectRequest.update({ where: { id }, data, include: PROJECT_REQUEST_INCLUDE });
    });
}

export async function approveProjectRequest(id: string, reviewerId: string, comment?: string) {
    return prisma.$transaction(async (tx) => {
        const request = await tx.projectRequest.findUniqueOrThrow({
            where: { id },
            include: { members: true, attachments: true },
        });

        const project = await tx.project.create({
            data: {
                title: request.title,
                description: request.description,
                type: request.category,
                status: "IN_PROGRESS",
                startDate: new Date(),
                leaderId: request.createdById,
                requestId: request.id,
                ProjectMember: {
                    create: request.members.map((member) => ({
                        userId: member.userId,
                        role: member.role,
                    })),
                },
                ...(request.attachments.length > 0 && {
                    ProjectFile: {
                        create: request.attachments.map((attachment) => ({
                            filename: attachment.filename,
                            url: attachment.url,
                            mimeType: attachment.mimeType,
                            uploadedById: attachment.uploadedById,
                        })),
                    },
                }),
            },
            select: { id: true, title: true, status: true },
        });

        const updated = await tx.projectRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                rejectionReason: null,
                reviewNotes: comment ?? null,
                reviewedAt: new Date(),
                reviewedById: reviewerId,
            },
            include: PROJECT_REQUEST_INCLUDE,
        });

        return { request: updated, project };
    });
}

export async function rejectProjectRequest(id: string, reviewerId: string, reason: string, notes?: string) {
    return prisma.projectRequest.update({
        where: { id },
        data: {
            status: "REJECTED",
            rejectionReason: reason,
            reviewNotes: notes ?? null,
            reviewedAt: new Date(),
            reviewedById: reviewerId,
        },
        include: PROJECT_REQUEST_INCLUDE,
    });
}
