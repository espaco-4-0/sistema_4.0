import { Prisma } from "@/src/generated/prisma/client";
import { CourseResource } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/infra/data/prisma";

import { CourseAccessPayload, CourseSchedulePayload, CreateCoursePayload, PatchCoursePayload } from "./courses.schema";

export const COURSE_ADMIN_INCLUDE = {
    professor: {
        select: { id: true, fullName: true, email: true },
    },
    CourseSchedule: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: {
            location: { select: { id: true, name: true } },
        },
    },
    CourseAccess: {
        orderBy: { resource: "asc" },
    },
    _count: {
        select: { Lesson: true, Enrollment: true },
    },
} satisfies Prisma.CourseInclude;

export type AdminCourse = Prisma.CourseGetPayload<{ include: typeof COURSE_ADMIN_INCLUDE }>;

function toDateOnly(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(`${value}T00:00:00.000Z`);
}

function toScheduleCreateInput(agenda: CourseSchedulePayload[]) {
    return agenda.map((slot) => ({
        dayOfWeek: slot.diaSemana,
        startTime: slot.horaInicio,
        endTime: slot.horaFim,
        locationId: slot.localId ?? null,
    }));
}

function toAccessCreateInput(acessos: CourseAccessPayload) {
    return acessos.map((entry) => ({
        resource: entry.recurso as CourseResource,
        enabled: entry.liberado,
    }));
}

export async function findInvalidScheduleLocations(agenda: CourseSchedulePayload[]): Promise<string[]> {
    const locationIds = [...new Set(agenda.map((slot) => slot.localId).filter((id): id is string => !!id))];

    if (locationIds.length === 0) return [];

    const found = await prisma.location.findMany({
        where: { id: { in: locationIds }, isActive: true },
        select: { id: true },
    });

    const foundIds = new Set(found.map((location) => location.id));

    return locationIds.filter((id) => !foundIds.has(id));
}

export async function createCourse(payload: CreateCoursePayload, professorId: string): Promise<AdminCourse> {
    return prisma.course.create({
        data: {
            title: payload.titulo,
            description: payload.descricao,
            workload: payload.cargaHoraria,
            capacity: payload.vagas ?? null,
            startDate: toDateOnly(payload.dataInicio) ?? null,
            endDate: toDateOnly(payload.dataFim) ?? null,
            isActive: payload.ativo ?? true,
            professorId,
            ...(payload.agenda && {
                CourseSchedule: { create: toScheduleCreateInput(payload.agenda) },
            }),
            ...(payload.acessos && {
                CourseAccess: { create: toAccessCreateInput(payload.acessos) },
            }),
        },
        include: COURSE_ADMIN_INCLUDE,
    });
}

export async function updateCourse(
    id: string,
    payload: PatchCoursePayload,
    professorId?: string
): Promise<AdminCourse> {
    const data: Prisma.CourseUpdateInput = {};

    if (payload.titulo !== undefined) data.title = payload.titulo;
    if (payload.descricao !== undefined) data.description = payload.descricao;
    if (payload.cargaHoraria !== undefined) data.workload = payload.cargaHoraria;
    if (payload.vagas !== undefined) data.capacity = payload.vagas;
    if (payload.dataInicio !== undefined) data.startDate = toDateOnly(payload.dataInicio);
    if (payload.dataFim !== undefined) data.endDate = toDateOnly(payload.dataFim);
    if (payload.ativo !== undefined) data.isActive = payload.ativo;
    if (professorId !== undefined) data.professor = { connect: { id: professorId } };

    return prisma.$transaction(async (tx) => {
        if (payload.agenda !== undefined) {
            await tx.courseSchedule.deleteMany({ where: { courseId: id } });
            await tx.courseSchedule.createMany({
                data: toScheduleCreateInput(payload.agenda).map((slot) => ({ ...slot, courseId: id })),
            });
        }

        if (payload.acessos !== undefined) {
            await tx.courseAccess.deleteMany({ where: { courseId: id } });
            await tx.courseAccess.createMany({
                data: toAccessCreateInput(payload.acessos).map((entry) => ({ ...entry, courseId: id })),
            });
        }

        return tx.course.update({ where: { id }, data, include: COURSE_ADMIN_INCLUDE });
    });
}

export async function replaceCourseAgenda(courseId: string, agenda: CourseSchedulePayload[]): Promise<AdminCourse> {
    return updateCourse(courseId, { agenda });
}

export async function replaceCourseAccess(courseId: string, acessos: CourseAccessPayload): Promise<AdminCourse> {
    return updateCourse(courseId, { acessos });
}

export type CourseDeletionBlockers = {
    lessons: number;
    enrollments: number;
};

export async function getCourseDeletionBlockers(courseId: string): Promise<CourseDeletionBlockers> {
    const [lessons, enrollments] = await Promise.all([
        prisma.lesson.count({ where: { courseId } }),
        prisma.enrollment.count({ where: { courseId } }),
    ]);

    return { lessons, enrollments };
}

export async function deleteCourse(courseId: string): Promise<void> {
    await prisma.$transaction([
        prisma.presence.deleteMany({ where: { lesson: { courseId } } }),
        prisma.lessonMonitor.deleteMany({ where: { lesson: { courseId } } }),
        prisma.lesson.deleteMany({ where: { courseId } }),
        prisma.course.delete({ where: { id: courseId } }),
    ]);
}

export async function listEnabledResourcesForUser(userId: string): Promise<CourseResource[]> {
    const accesses = await prisma.courseAccess.findMany({
        where: {
            enabled: true,
            course: {
                isActive: true,
                Enrollment: {
                    some: { userId, status: { not: "CANCELLED" } },
                },
            },
        },
        select: { resource: true },
        distinct: ["resource"],
    });

    return accesses.map((access) => access.resource);
}

export async function findCourseById(id: string): Promise<AdminCourse | null> {
    return prisma.course.findUnique({ where: { id }, include: COURSE_ADMIN_INCLUDE });
}

/** Seleciona apenas id + professorId — campos suficientes para checar ownership antes de editar. */
export async function findCourseForEdit(id: string): Promise<{ id: string; professorId: string } | null> {
    return prisma.course.findUnique({ where: { id }, select: { id: true, professorId: true } });
}

export async function findCourseSchedule(courseId: string) {
    return prisma.courseSchedule.findMany({
        where: { courseId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: { location: { select: { id: true, name: true } } },
    });
}

export async function findCourseAccess(courseId: string) {
    return prisma.courseAccess.findMany({
        where: { courseId },
        select: { resource: true, enabled: true },
    });
}

export async function findUserForValidation(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true, role: true },
    });
}

export async function listCourses(filters: {
    q?: string;
    professorId?: string;
    isActive?: boolean;
}): Promise<AdminCourse[]> {
    return prisma.course.findMany({
        where: {
            ...(filters.q && { title: { contains: filters.q, mode: "insensitive" } }),
            ...(filters.professorId && { professorId: filters.professorId }),
            ...(typeof filters.isActive === "boolean" && { isActive: filters.isActive }),
        },
        include: COURSE_ADMIN_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
}
