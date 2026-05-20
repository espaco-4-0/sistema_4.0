import { PrismaClient } from "@/src/generated/prisma/client";

export async function seedAula(prisma: PrismaClient, cursoId: string, professorId: string) {
    console.log("Semeando Aulas...");

    const aulas = [
        {
            id: "aula-1",
            title: "Introdução",
            startDate: new Date("2026-05-10T08:00:00"),
            durationMin: 60,
        },
        {
            id: "aula-2",
            title: "Fundamentos",
            startDate: new Date("2026-05-11T08:00:00"),
            durationMin: 90,
        },
        {
            id: "aula-3",
            title: "Prática",
            startDate: new Date("2026-05-12T08:00:00"),
            durationMin: 120,
        },
    ];

    for (const aula of aulas) {
        const { id, ...data } = aula;

        await prisma.lesson.upsert({
            where: { id },
            update: data,
            create: {
                id,
                ...data,
                course: {
                    connect: { id: cursoId },
                },
                professor: {
                    connect: { id: professorId },
                },
            },
        });
    }

    console.log("Aulas semeadas com sucesso!");
}
