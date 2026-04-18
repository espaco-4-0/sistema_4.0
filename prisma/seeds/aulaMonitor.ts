import { PrismaClient, StatusInscricao } from "@/src/generated/prisma/client";

export async function seedInscricao(prisma: PrismaClient, cursoId: string, userId: string) {
    console.log("Semeando inscrições...");

    const inscricaoId = "inscricao-1";

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
            id: inscricaoId,
            status: StatusInscricao.CONFIRMADA,
            dataEscolhida: new Date(),
            user: { connect: { id: userId } },
            curso: { connect: { id: cursoId } },
        },
    });

    console.log("Inscrição criada com sucesso!");
}
