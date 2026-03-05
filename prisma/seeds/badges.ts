import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedBadges(prisma: PrismaClient) {
    const badges = [
        {
            nome: "Primeira Presença",
            descricao: "Confirmou presença pela primeira vez.",
            pontos: 50,
        },
        {
            nome: "Explorador",
            descricao: "Se inscreveu em 3 ou mais cursos.",
            pontos: 100,
        },
        {
            nome: "Colaborador",
            descricao: "Participou de um projeto como membro.",
            pontos: 150,
        },
        {
            nome: "Autor",
            descricao: "Publicou o primeiro post no blog.",
            pontos: 80,
        },
        {
            nome: "Certificado de Ouro",
            descricao: "Concluiu 5 cursos com presença confirmada.",
            pontos: 300,
        },
    ];

    for (const b of badges) {
        await prisma.badge.upsert({
            where: { nome: b.nome },
            update: {},
            create: b,
        });
    }

    console.log("Badges criados uhulll");
}
