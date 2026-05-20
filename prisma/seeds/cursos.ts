import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedCursos(prisma: PrismaClient) {
    const professor = await prisma.user.findUniqueOrThrow({
        where: { email: "professor@ifal.edu.br" },
    });

    const cursos = [
        {
            id: "curso-web-01",
            title: "Desenvolvimento Web com Next.js",
            description: "Curso prático de desenvolvimento web com Next.js e React.",
            workload: 40,
            professorId: professor.id,
        },
        {
            id: "curso-python-01",
            title: "Python para Iniciantes",
            description: "Introdução à programação com Python.",
            workload: 20,
            professorId: professor.id,
        },
        {
            id: "curso-dados-01",
            title: "Ciência de Dados Aplicada",
            description: "Fundamentos de análise de dados e visualização.",
            workload: 60,
            professorId: professor.id,
        },
    ];

    for (const c of cursos) {
        await prisma.course.upsert({
            where: { id: c.id },
            update: {},
            create: c,
        });
    }

    console.log("Cursos criados vamooo!!");
}
