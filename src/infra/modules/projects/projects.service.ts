import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { CreateTaskPayload, PatchProjectPayload, PatchTaskPayload } from "./projects.schema";

export const PROJECT_INCLUDE = {
    leader: { select: { id: true, fullName: true, email: true } },
    ProjectMember: {
        include: { user: { select: { id: true, fullName: true, email: true } } },
    },
    ProjectFile: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
    },
    request: { select: { id: true, status: true } },
    _count: { select: { Task: true, ProjectFile: true, ProjectMember: true } },
} satisfies Prisma.ProjectInclude;

export const TASK_INCLUDE = {
    assignedTo: { select: { id: true, fullName: true, email: true } },
    project: { select: { id: true, title: true, leaderId: true } },
} satisfies Prisma.TaskInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>;

function toDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(`${value}T00:00:00.000Z`);
}

export interface ListProjectsFilter {
    status?: string | null;
    type?: string | null;
    memberId?: string;
    search?: string;
}

export async function listProjects(filter: ListProjectsFilter) {
    return prisma.project.findMany({
        where: {
            ...(filter.status ? { status: filter.status as never } : {}),
            ...(filter.type ? { type: filter.type as never } : {}),
            ...(filter.search ? { title: { contains: filter.search, mode: "insensitive" } } : {}),
            ...(filter.memberId
                ? {
                      OR: [{ leaderId: filter.memberId }, { ProjectMember: { some: { userId: filter.memberId } } }],
                  }
                : {}),
        },
        include: PROJECT_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
}

export async function getProject(id: string) {
    return prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
}

export async function updateProject(id: string, payload: PatchProjectPayload) {
    const data: Prisma.ProjectUpdateInput = {};

    if (payload.titulo !== undefined) data.title = payload.titulo;
    if (payload.descricao !== undefined) data.description = payload.descricao;
    if (payload.tipo !== undefined) data.type = payload.tipo;
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.dataInicio !== undefined) data.startDate = toDate(payload.dataInicio);
    if (payload.dataFim !== undefined) data.endDate = toDate(payload.dataFim);
    if (payload.liderId !== undefined) data.leader = { connect: { id: payload.liderId } };

    return prisma.$transaction(async (tx) => {
        if (payload.integrantes !== undefined) {
            await tx.projectMember.deleteMany({ where: { projectId: id } });
            await tx.projectMember.createMany({
                data: payload.integrantes.map((member) => ({
                    projectId: id,
                    userId: member.userId,
                    role: member.papel ?? null,
                })),
            });
        }

        return tx.project.update({ where: { id }, data, include: PROJECT_INCLUDE });
    });
}

export async function canManageProject(projectId: string, userId: string, role: string): Promise<boolean> {
    if (role === "ADMIN" || role === "PROFESSOR") return true;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            leaderId: true,
            ProjectMember: { where: { userId }, select: { id: true } },
        },
    });

    if (!project) return false;

    return project.leaderId === userId || project.ProjectMember.length > 0;
}

function progressForStatus(status: string | undefined, explicit: number | undefined, current?: number) {
    if (explicit !== undefined) return explicit;
    if (status === "DONE") return 100;
    if (status === "TODO" && current === 100) return 0;
    return undefined;
}

export async function listTasks(projectId: string, status?: string | null) {
    return prisma.task.findMany({
        where: { projectId, ...(status ? { status: status as never } : {}) },
        include: TASK_INCLUDE,
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    });
}

export async function getTask(id: string) {
    return prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
}

export async function createTask(projectId: string, payload: CreateTaskPayload) {
    return prisma.task.create({
        data: {
            projectId,
            title: payload.titulo,
            description: payload.descricao ?? null,
            status: payload.status ?? "TODO",
            progress: progressForStatus(payload.status, payload.progresso) ?? 0,
            dueDate: payload.prazo ? new Date(payload.prazo) : null,
            assignedToId: payload.responsavelId ?? null,
        },
        include: TASK_INCLUDE,
    });
}

export async function updateTask(id: string, payload: PatchTaskPayload, currentProgress?: number) {
    const data: Prisma.TaskUpdateInput = {};

    if (payload.titulo !== undefined) data.title = payload.titulo;
    if (payload.descricao !== undefined) data.description = payload.descricao;
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.prazo !== undefined) data.dueDate = payload.prazo ? new Date(payload.prazo) : null;
    if (payload.responsavelId !== undefined) {
        data.assignedTo = payload.responsavelId ? { connect: { id: payload.responsavelId } } : { disconnect: true };
    }

    const progress = progressForStatus(payload.status, payload.progresso, currentProgress);
    if (progress !== undefined) data.progress = progress;

    return prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
}

export async function deleteTask(id: string) {
    await prisma.task.delete({ where: { id } });
}
