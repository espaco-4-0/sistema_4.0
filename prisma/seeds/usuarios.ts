import bcrypt from "bcryptjs";

import { Education, IfalAffiliation, PrismaClient, Race, UserRole } from "../../src/generated/prisma/client";

interface UsuarioSeed {
    email: string;
    nomeCompleto: string;
    senha: string;
    role: keyof typeof UserRole;
    dataNascimento: Date;
    telefone: string;
    raca: keyof typeof Race;
    educacao: keyof typeof Education;
    ifalAfiliacao: keyof typeof IfalAffiliation;
    deficiencia?: string;
    necessidadeEspecial?: string;
}

const usuarios: UsuarioSeed[] = [
    {
        email: "admin@ifal.edu.br",
        nomeCompleto: "Administrador do Sistema",
        senha: "Admin@1234",
        role: "ADMIN",
        dataNascimento: new Date("1980-01-10"),
        telefone: "+55 82 90000-0001",
        raca: "BRANCA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "EX_ALUNO",
    },

    {
        email: "professor@ifal.edu.br",
        nomeCompleto: "Prof. João Silva",
        senha: "Professor@1234",
        role: "PROFESSOR",
        dataNascimento: new Date("1975-04-22"),
        telefone: "+55 82 90000-0002",
        raca: "PARDA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "EX_ALUNO",
    },

    {
        email: "monitor@ifal.edu.br",
        nomeCompleto: "Maria Monitor",
        senha: "Monitor@1234",
        role: "MONITOR",
        dataNascimento: new Date("1996-09-12"),
        telefone: "+55 82 90000-0003",
        raca: "PARDA",
        educacao: "SUPERIOR_CURSANDO",
        ifalAfiliacao: "ALUNO",
    },
    {
        email: "tecnico@ifal.edu.br",
        nomeCompleto: "Roberto Técnico",
        senha: "Monitor@1234",
        role: "MONITOR",
        dataNascimento: new Date("1985-12-03"),
        telefone: "+55 82 90000-0012",
        raca: "BRANCA",
        educacao: "MEDIO_COMPLETO",
        ifalAfiliacao: "EX_ALUNO",
    },

    {
        email: "pesquisador@ifal.edu.br",
        nomeCompleto: "Carlos Pesqueira",
        senha: "Pesquisador@1234",
        role: "PESQUISADOR",
        dataNascimento: new Date("1988-06-30"),
        telefone: "+55 82 90000-0004",
        raca: "PARDA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "EX_ALUNO",
    },
    {
        email: "pesquisa2@ifal.edu.br",
        nomeCompleto: "Fernanda Lima",
        senha: "Pesquisador@1234",
        role: "PESQUISADOR",
        dataNascimento: new Date("1983-03-18"),
        telefone: "+55 82 90000-0013",
        raca: "PRETA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "NAO_ALUNO",
        deficiencia: "VISUAL",
        necessidadeEspecial: "LEITOR_DE_TELA",
    },

    {
        email: "visitante@email.com",
        nomeCompleto: "Ana Visitante",
        senha: "Visitante@1234",
        role: "VISITANTE",
        dataNascimento: new Date("1992-11-05"),
        telefone: "+55 82 90000-0005",
        raca: "BRANCA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "NAO_ALUNO",
    },
    {
        email: "aluno1@ifal.edu.br",
        nomeCompleto: "Lucas Almeida",
        senha: "Visitante@1234",
        role: "VISITANTE",
        dataNascimento: new Date("2000-02-14"),
        telefone: "+55 82 90000-0010",
        raca: "PARDA",
        educacao: "SUPERIOR_CURSANDO",
        ifalAfiliacao: "ALUNO",
    },
    {
        email: "aluno2@ifal.edu.br",
        nomeCompleto: "Beatriz Costa",
        senha: "Visitante@1234",
        role: "VISITANTE",
        dataNascimento: new Date("1999-07-21"),
        telefone: "+55 82 90000-0011",
        raca: "PRETA",
        educacao: "MEDIO_COMPLETO",
        ifalAfiliacao: "ALUNO",
        deficiencia: "AUDITIVA",
        necessidadeEspecial: "ACESSO_A_LEGENDAS",
    },
    {
        email: "externo@ifal.edu.br",
        nomeCompleto: "Rafael Externo",
        senha: "Visitante@1234",
        role: "VISITANTE",
        dataNascimento: new Date("1991-08-09"),
        telefone: "+55 82 90000-0014",
        raca: "AMARELA",
        educacao: "SUPERIOR_COMPLETO",
        ifalAfiliacao: "NAO_ALUNO",
    },
];

export async function seedUsuarios(prisma: PrismaClient): Promise<void> {
    console.log("\nIniciando seed de usuários...\n");

    let criados = 0;
    let ignorados = 0;

    for (const u of usuarios) {
        const senhaHash = await bcrypt.hash(u.senha, 12);

        const resultado = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                nomeCompleto: u.nomeCompleto,
                senha: senhaHash,
                role: UserRole[u.role],
                dataNascimento: u.dataNascimento,
                telefone: u.telefone,
                raca: Race[u.raca],
                educacao: Education[u.educacao],
                ifalAfiliacao: IfalAffiliation[u.ifalAfiliacao],
                deficiencia: u.deficiencia ?? null,
                necessidadeEspecial: u.necessidadeEspecial ?? null,
            },
        });

        if (resultado) {
            console.log(`CRIADO: ${u.role.padEnd(12)} │ ${u.email}`);
            criados++;
        } else {
            console.log(`Problema na criaçäo  │ ${u.email}`);
            ignorados++;
        }
    }

    console.log("\nUsuários criados vem q ta tendo");
}
