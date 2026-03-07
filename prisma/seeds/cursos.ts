import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedCursos(prisma: PrismaClient) {
    const professor = await prisma.user.findUniqueOrThrow({
        where: { email: "professor@ifal.edu.br" },
    });

    const cursos = [
        {
            id: "curso-web-01",
            titulo: "Desenvolvimento Web com Next.js",
            descricao: "Curso prático de desenvolvimento web com Next.js e React.",
            cargaHoraria: 40,
            professorId: professor.id,
        },
        {
            id: "curso-python-01",
            titulo: "Python para Iniciantes",
            descricao: "Introdução à programação com Python.",
            cargaHoraria: 20,
            professorId: professor.id,
        },
        {
            id: "curso-dados-01",
            titulo: "Ciência de Dados Aplicada",
            descricao: "Fundamentos de análise de dados e visualização.",
            cargaHoraria: 60,
            professorId: professor.id,
        },
    ];

    for (const c of cursos) {
        await prisma.curso.upsert({
            where: { id: c.id },
            update: {},
            create: c,
        });
    }

    console.log("Cursos criados vamooo!!");
}
