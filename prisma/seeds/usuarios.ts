import bcrypt from "bcryptjs";

import { Education, PrismaClient, Race, UserRole } from "../../src/generated/prisma/client";
import { IfalAfiliation } from "./../../src/generated/prisma/enums";

export async function seedUsuarios(prisma: PrismaClient) {
    const usuarios = [
        {
            email: "admin@ifal.edu.br",
            nome: "Administrador",
            role: "ADMIN",
            dataNascimento: "1980-01-10",
            telefone: "+55 82 90000-0001",
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "professor@ifal.edu.br",
            nome: "Prof. João Silva",
            role: "PROFESSOR",
            dataNascimento: "1975-04-22",
            telefone: "+55 82 90000-0002",
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "monitor@ifal.edu.br",
            nome: "Maria Monitor",
            role: "MONITOR",
            dataNascimento: "1996-09-12",
            telefone: "+55 82 90000-0003",
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "pesquisador@ifal.edu.br",
            nome: "Carlos Pesq.",
            role: "PESQUISADOR",
            dataNascimento: "1988-06-30",
            telefone: "+55 82 90000-0004",

            ifalAfiliacao: false,
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "visitante@email.com",
            nome: "Ana Visitante",
            role: "VISITANTE",
            dataNascimento: "1992-11-05",
            telefone: "+55 82 90000-0005",

            ifalAfiliacao: false,
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },

        // Novos usuários fictícios
        {
            email: "aluno1@ifal.edu.br",
            nome: "Lucas Almeida",
            role: "VISITANTE",
            dataNascimento: "2000-02-14",
            telefone: "+55 82 90000-0010",
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "aluno2@ifal.edu.br",
            nome: "Beatriz Costa",
            role: "VISITANTE",
            dataNascimento: "1999-07-21",
            telefone: "+55 82 90000-0011",
            deficiencia: "AUDITIVA",
            necessidadeEspecial: "ACESSO_A_LEGENDAS",
        },
        {
            email: "tecnico@ifal.edu.br",
            nome: "Roberto Técnico",
            role: "MONITOR",
            dataNascimento: "1985-12-03",
            telefone: "+55 82 90000-0012",
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
        {
            email: "pesquisa2@ifal.edu.br",
            nome: "Fernanda Lima",
            role: "PESQUISADOR",
            dataNascimento: "1983-03-18",
            telefone: "+55 82 90000-0013",

            ifalAfiliacao: false,
            deficiencia: "VISUAL",
            necessidadeEspecial: "LEITOR_DE_TELA",
        },
        {
            email: "externo@ifal.edu.br",
            nome: "Rafael Externo",
            role: "VISITANTE",
            dataNascimento: "1991-08-09",
            telefone: "+55 82 90000-0014",

            ifalAfiliacao: false,
            deficiencia: "NENHUMA",
            necessidadeEspecial: "NENHUMA",
        },
    ];

    const defaultSenha = await bcrypt.hash("trocar_em_producao", 10);

    for (const u of usuarios) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                nomeCompleto: (u as any).nome ?? (u as any).nomeCompleto ?? "",
                role: UserRole[u.role as keyof typeof UserRole],
                senha: defaultSenha,
                dataNascimento: u.dataNascimento,
                telefone: u.telefone,
                raca: Race.AMARELA,
                educacao: Education.FUNDAMENTAL_COMPLETO,
                ifalAfiliacao: IfalAfiliation.ALUNO,
                deficiencia: u.deficiencia,
                necessidadeEspecial: u.necessidadeEspecial,
            },
        });
    }

    console.log("Usuários criados vem q ta tendo");
}
