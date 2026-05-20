import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedBadges(prisma: PrismaClient) {
    const badges = [
        {
            name: "Primeira Presença",
            description: "Confirmou presença pela primeira vez.",
            points: 50,
        },
        {
            name: "Explorador",
            description: "Se inscreveu em 3 ou mais cursos.",
            points: 100,
        },
        {
            name: "Colaborador",
            description: "Participou de um projeto como membro.",
            points: 150,
        },
        {
            name: "Autor",
            description: "Publicou o primeiro post no blog.",
            points: 80,
        },
        {
            name: "Certificado de Ouro",
            description: "Concluiu 5 cursos com presença confirmada.",
            points: 300,
        },
    ];

    for (const b of badges) {
        await prisma.badge.upsert({
            where: { name: b.name },
            update: {},
            create: b,
        });
    }

    console.log("Badges criados uhulll");
}
