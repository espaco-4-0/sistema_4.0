import { EnrollmentStatus, PrismaClient } from "@/src/generated/prisma/client";

export async function seedInscricao(prisma: PrismaClient, cursoId: string, userId: string) {
    console.log("Semeando inscrições...");

    const inscricaoId = "inscricao-1";

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
            id: inscricaoId,
            status: EnrollmentStatus.CONFIRMED,
            chosenDate: new Date(),
            user: { connect: { id: userId } },
            course: { connect: { id: cursoId } },
        },
    });

    console.log("Inscrição criada com sucesso!");
}
