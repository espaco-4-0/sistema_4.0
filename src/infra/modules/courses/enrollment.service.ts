import { prisma } from "@/src/infra/data/prisma";
import { ConflictError, NotFoundError } from "@/src/lib/errors/AppError";

export type CourseForSubscription = {
    id: string;
    isActive: boolean;
    capacity: number | null;
    _count: { Enrollment: number };
};

export async function findCourseForSubscription(courseId: string): Promise<CourseForSubscription | null> {
    return prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            isActive: true,
            capacity: true,
            _count: { select: { Enrollment: true } },
        },
    });
}

export async function findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
}

/** Valida todas as regras de negócio antes de criar a matrícula. Lança AppError em caso de violação. */
export async function enrollUser(userId: string, courseId: string) {
    const course = await findCourseForSubscription(courseId);

    if (!course) throw new NotFoundError("Curso", courseId);
    if (!course.isActive) throw new ConflictError("Curso inativo para inscrição");

    const existing = await findEnrollment(userId, courseId);
    if (existing) throw new ConflictError("Você já está inscrito neste curso");

    if (course.capacity !== null && course._count.Enrollment >= course.capacity) {
        throw new ConflictError(`As vagas para este curso estão esgotadas (total: ${course.capacity})`);
    }

    return prisma.enrollment.create({ data: { userId, courseId } });
}

export async function unenrollUser(userId: string, courseId: string): Promise<void> {
    const existing = await findEnrollment(userId, courseId);

    if (!existing) throw new NotFoundError("Inscrição");

    await prisma.enrollment.delete({
        where: { userId_courseId: { userId, courseId } },
    });
}
