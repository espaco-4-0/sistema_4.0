import { PrismaClient, StatusProjeto, TipoProjeto } from "../../src/generated/prisma/client";

export async function seedProjetos(prisma: PrismaClient) {
    const professor = await prisma.user.findUniqueOrThrow({ where: { email: "professor@ifal.edu.br" } });
    const pesquisador = await prisma.user.findUniqueOrThrow({ where: { email: "pesquisador@ifal.edu.br" } });
    const monitor = await prisma.user.findUniqueOrThrow({ where: { email: "monitor@ifal.edu.br" } });

    const projetos = [
        {
            id: "proj-ext-01",
            titulo: "Inclusão Digital nas Comunidades",
            descricao: "Levar tecnologia e capacitação para comunidades rurais do Alagoas.",
            tipo: TipoProjeto.EXTENSAO,
            status: StatusProjeto.EM_ANDAMENTO,
            dataInicio: new Date("2026-01-01"),
            liderId: professor.id,
        },
        {
            id: "proj-pesq-01",
            titulo: "IA Aplicada ao Ensino Técnico",
            descricao: "Pesquisa sobre o uso de inteligência artificial em ambientes de ensino técnico.",
            tipo: TipoProjeto.PESQUISA,
            status: StatusProjeto.EM_ANDAMENTO,
            dataInicio: new Date("2026-02-01"),
            liderId: pesquisador.id,
        },
    ];

    for (const p of projetos) {
        await prisma.projeto.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        });
    }

    // Membros
    await prisma.projetoMembro.upsert({
        where: {
            projetoId_userId: {
                projetoId: "proj-ext-01",
                userId: monitor.id,
            },
        },
        update: {},
        create: {
            projetoId: "proj-ext-01",
            userId: monitor.id,
            funcao: "Monitor",
        },
    });
    await prisma.projetoMembro.upsert({
        where: {
            projetoId_userId: {
                projetoId: "proj-pesq-01",
                userId: professor.id,
            },
        },
        update: {},
        create: {
            projetoId: "proj-pesq-01",
            userId: professor.id,
            funcao: "Colaborador",
        },
    });

    console.log("Projetos e membros criados");
}
