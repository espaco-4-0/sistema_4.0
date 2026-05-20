import { EnrollmentStatus, PrismaClient } from "@/src/generated/prisma/client";

export async function seedInscricao(prisma: PrismaClient, userId: string, cursoId: string) {
    console.log("Semeando inscrição do aluno no curso...");

    await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: cursoId,
            },
        },
        update: {
            status: EnrollmentStatus.CONFIRMED,
        },
        create: {
            status: EnrollmentStatus.CONFIRMED,
            chosenDate: new Date(),
            user: {
                connect: { id: userId },
            },
            course: {
                connect: { id: cursoId },
            },
        },
    });

    console.log("Inscrição concluída com sucesso!");
}
