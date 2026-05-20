import { PrismaClient, ProjectStatus, ProjectType } from "../../src/generated/prisma/client";

export async function seedProjetos(prisma: PrismaClient) {
    const professor = await prisma.user.findUniqueOrThrow({ where: { email: "professor@ifal.edu.br" } });
    const pesquisador = await prisma.user.findUniqueOrThrow({ where: { email: "pesquisador@ifal.edu.br" } });
    const monitor = await prisma.user.findUniqueOrThrow({ where: { email: "monitor@ifal.edu.br" } });

    const projetos = [
        {
            id: "proj-ext-01",
            title: "Inclusão Digital nas Comunidades",
            description: "Levar tecnologia e capacitação para comunidades rurais do Alagoas.",
            type: ProjectType.EXTENSION,
            status: ProjectStatus.IN_PROGRESS,
            startDate: new Date("2026-01-01"),
            leaderId: professor.id,
        },
        {
            id: "proj-pesq-01",
            title: "IA Aplicada ao Ensino Técnico",
            description: "Pesquisa sobre o uso de inteligência artificial em ambientes de ensino técnico.",
            type: ProjectType.RESEARCH,
            status: ProjectStatus.IN_PROGRESS,
            startDate: new Date("2026-02-01"),
            leaderId: pesquisador.id,
        },
    ];

    for (const p of projetos) {
        await prisma.project.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        });
    }

    // Membros
    await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId: "proj-ext-01",
                userId: monitor.id,
            },
        },
        update: {},
        create: {
            projectId: "proj-ext-01",
            userId: monitor.id,
            role: "Monitor",
        },
    });
    await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId: "proj-pesq-01",
                userId: professor.id,
            },
        },
        update: {},
        create: {
            projectId: "proj-pesq-01",
            userId: professor.id,
            role: "Colaborador",
        },
    });

    console.log("Projetos e membros criados");
}
