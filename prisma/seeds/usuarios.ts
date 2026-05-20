import bcrypt from "bcryptjs";

import { Education, IfalAffiliation, PrismaClient, Race, UserRole } from "../../src/generated/prisma/client";

interface UsuarioSeed {
    email: string;
    fullName: string;
    password: string;
    role: keyof typeof UserRole;
    birthDate: Date;
    phone: string;
    race: keyof typeof Race;
    education: keyof typeof Education;
    ifalAffiliation: keyof typeof IfalAffiliation;
    disability?: string;
    specialNeed?: string;
}

const usuarios: UsuarioSeed[] = [
    {
        email: "admin@ifal.edu.br",
        fullName: "Administrador do Sistema",
        password: "Admin@1234",
        role: "ADMIN",
        birthDate: new Date("1980-01-10"),
        phone: "+55 82 90000-0001",
        race: "WHITE",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "ALUMNI",
    },

    {
        email: "professor@ifal.edu.br",
        fullName: "Prof. João Silva",
        password: "Professor@1234",
        role: "PROFESSOR",
        birthDate: new Date("1975-04-22"),
        phone: "+55 82 90000-0002",
        race: "BROWN",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "ALUMNI",
    },

    {
        email: "monitor@ifal.edu.br",
        fullName: "Maria Monitor",
        password: "Monitor@1234",
        role: "MONITOR",
        birthDate: new Date("1996-09-12"),
        phone: "+55 82 90000-0003",
        race: "BROWN",
        education: "HIGHER_EDUCATION_IN_PROGRESS",
        ifalAffiliation: "STUDENT",
    },
    {
        email: "tecnico@ifal.edu.br",
        fullName: "Roberto Técnico",
        password: "Monitor@1234",
        role: "MONITOR",
        birthDate: new Date("1985-12-03"),
        phone: "+55 82 90000-0012",
        race: "WHITE",
        education: "HIGH_SCHOOL_COMPLETE",
        ifalAffiliation: "ALUMNI",
    },

    {
        email: "pesquisador@ifal.edu.br",
        fullName: "Carlos Pesqueira",
        password: "Pesquisador@1234",
        role: "RESEARCHER",
        birthDate: new Date("1988-06-30"),
        phone: "+55 82 90000-0004",
        race: "BROWN",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "ALUMNI",
    },
    {
        email: "pesquisa2@ifal.edu.br",
        fullName: "Fernanda Lima",
        password: "Pesquisador@1234",
        role: "RESEARCHER",
        birthDate: new Date("1983-03-18"),
        phone: "+55 82 90000-0013",
        race: "BLACK",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "NOT_STUDENT",
        disability: "VISUAL",
        specialNeed: "LEITOR_DE_TELA",
    },

    {
        email: "visitante@email.com",
        fullName: "Ana Visitante",
        password: "Visitante@1234",
        role: "VISITOR",
        birthDate: new Date("1992-11-05"),
        phone: "+55 82 90000-0005",
        race: "WHITE",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "NOT_STUDENT",
    },
    {
        email: "aluno1@ifal.edu.br",
        fullName: "Lucas Almeida",
        password: "Visitante@1234",
        role: "VISITOR",
        birthDate: new Date("2000-02-14"),
        phone: "+55 82 90000-0010",
        race: "BROWN",
        education: "HIGHER_EDUCATION_IN_PROGRESS",
        ifalAffiliation: "STUDENT",
    },
    {
        email: "aluno2@ifal.edu.br",
        fullName: "Beatriz Costa",
        password: "Visitante@1234",
        role: "VISITOR",
        birthDate: new Date("1999-07-21"),
        phone: "+55 82 90000-0011",
        race: "BLACK",
        education: "HIGH_SCHOOL_COMPLETE",
        ifalAffiliation: "STUDENT",
        disability: "AUDITIVA",
        specialNeed: "ACESSO_A_LEGENDAS",
    },
    {
        email: "externo@ifal.edu.br",
        fullName: "Rafael Externo",
        password: "Visitante@1234",
        role: "VISITOR",
        birthDate: new Date("1991-08-09"),
        phone: "+55 82 90000-0014",
        race: "YELLOW",
        education: "HIGHER_EDUCATION_COMPLETE",
        ifalAffiliation: "NOT_STUDENT",
    },
];

export async function seedUsuarios(prisma: PrismaClient): Promise<void> {
    console.log("\nIniciando seed de usuários...\n");

    let criados = 0;
    let ignorados = 0;

    for (const u of usuarios) {
        const senhaHash = await bcrypt.hash(u.password, 12);

        const resultado = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                fullName: u.fullName,
                password: senhaHash,
                role: UserRole[u.role],
                birthDate: u.birthDate,
                phone: u.phone,
                race: Race[u.race],
                education: Education[u.education],
                ifalAffiliation: IfalAffiliation[u.ifalAffiliation],
                disability: u.disability ?? null,
                specialNeed: u.specialNeed ?? null,
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
