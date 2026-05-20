import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedLocais(prisma: PrismaClient) {
    const locais = [
        {
            id: "local-lab-01",
            name: "Laboratório de Informática 01",
            description: "30 computadores e projetor",
            capacity: 30,
        },
        {
            id: "local-lab-02",
            name: "Laboratório de Informática 02",
            description: "25 computadores e projetor",
            capacity: 25,
        },
        {
            id: "local-audit",
            name: "Auditório",
            description: "Espaço para eventos e palestras",
            capacity: 150,
        },
        {
            id: "local-sala-01",
            name: "Sala de Aula 01",
            description: "Sala convencional com lousa",
            capacity: 40,
        },
    ];

    for (const l of locais) {
        await prisma.location.upsert({
            where: { id: l.id },
            update: {},
            create: l,
        });
    }

    console.log("Locais criados Menos 1");
}
