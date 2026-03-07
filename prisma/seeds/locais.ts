import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedLocais(prisma: PrismaClient) {
    const locais = [
        {
            id: "local-lab-01",
            nome: "Laboratório de Informática 01",
            descricao: "30 computadores e projetor",
            capacidade: 30,
        },
        {
            id: "local-lab-02",
            nome: "Laboratório de Informática 02",
            descricao: "25 computadores e projetor",
            capacidade: 25,
        },
        {
            id: "local-audit",
            nome: "Auditório",
            descricao: "Espaço para eventos e palestras",
            capacidade: 150,
        },
        {
            id: "local-sala-01",
            nome: "Sala de Aula 01",
            descricao: "Sala convencional com lousa",
            capacidade: 40,
        },
    ];

    for (const l of locais) {
        await prisma.local.upsert({
            where: { id: l.id },
            update: {},
            create: l,
        });
    }

    console.log("Locais criados Menos 1");
}
