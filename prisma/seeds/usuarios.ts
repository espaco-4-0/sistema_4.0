import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedUsuarios(prisma: PrismaClient) {
    const usuarios = [
        {
            email: "admin@ifal.edu.br",
            nome: "Administrador",
            role: "ADMIN",
        },
        {
            email: "professor@ifal.edu.br",
            nome: "Prof. João Silva",
            role: "PROFESSOR",
        },
        {
            email: "monitor@ifal.edu.br",
            nome: "Maria Monitor",
            role: "MONITOR",
        },
        {
            email: "pesquisador@ifal.edu.br",
            nome: "Carlos Pesq.",
            role: "PESQUISADOR",
        },
        {
            email: "visitante@email.com",
            nome: "Ana Visitante",
            role: "VISITANTE",
        },
    ];

    for (const u of usuarios) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { ...u, senha: "trocar_em_producao" },
        });
    }

    console.log("Usuários criados vem q ta tendo");
}
