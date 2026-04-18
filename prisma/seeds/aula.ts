import { PrismaClient } from "@/src/generated/prisma/client";

export async function seedAula(prisma: PrismaClient, cursoId: string, professorId: string) {
    console.log("Semeando Aulas...");

    const aulas = [
        {
            id: "aula-1",
            titulo: "Introdução",
            dataHoraInicio: new Date("2026-05-10T08:00:00"),
            duracaoMin: 60,
        },
        {
            id: "aula-2",
            titulo: "Fundamentos",
            dataHoraInicio: new Date("2026-05-11T08:00:00"),
            duracaoMin: 90,
        },
        {
            id: "aula-3",
            titulo: "Prática",
            dataHoraInicio: new Date("2026-05-12T08:00:00"),
            duracaoMin: 120,
        },
    ];

    for (const aula of aulas) {
        const { id, ...data } = aula;

        await prisma.aula.upsert({
            where: { id },
            update: data,
            create: {
                id,
                ...data,
                curso: {
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
