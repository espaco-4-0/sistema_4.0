import { PrismaClient, StatusInscricao } from "@/src/generated/prisma/client";

export async function seedInscricao(prisma: PrismaClient, userId: string, cursoId: string) {
    console.log("Semeando inscrição do aluno no curso...");

    await prisma.inscricao.upsert({
        where: {
            userId_cursoId: {
                userId: userId,
                cursoId: cursoId,
            },
        },
        update: {
            status: StatusInscricao.CONFIRMADA,
        },
        create: {
            status: StatusInscricao.CONFIRMADA,
            dataEscolhida: new Date(),
            user: {
                connect: { id: userId },
            },
            curso: {
                connect: { id: cursoId },
            },
        },
    });

    console.log("Inscrição concluída com sucesso!");
}
