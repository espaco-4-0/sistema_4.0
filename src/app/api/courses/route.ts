import { prisma } from "@/src/infra/data/prisma";
import { createCourseSchema } from "@/src/infra/modules/courses/courses.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const q = searchParams.get("q")?.trim();
        const professorId = searchParams.get("professorId")?.trim();
        const ativoParam = searchParams.get("ativo")?.trim().toLowerCase();

        const ativo =
            ativoParam === "true" ? true : ativoParam === "false" ? false : ativoParam ? "invalid" : undefined;
        if (ativo === "invalid") {
            return NextResponse.json({ message: "Parâmetro 'ativo' inválido" }, { status: 400 });
        }

        const courses = await prisma.course.findMany({
            where: {
                ...(q && { title: { contains: q, mode: "insensitive" } }),
                ...(professorId && { professorId }),
                ...(typeof ativo === "boolean" && { isActive: ativo }),
            },
            include: {
                professor: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        Lesson: true,
                        Enrollment: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: courses }, { status: 200 });
    } catch {
        return NextResponse.json(
            {
                message: "Erro interno ao listar cursos",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                {
                    message: "Não autenticado",
                },
                { status: 401 }
            );
        }

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json(
                {
                    message: "Sem permissão para criar cursos",
                },
                { status: 403 }
            );
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = createCourseSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Dados inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 422 }
            );
        }

        const professorId =
            session.user.role === "ADMIN" && parsed.data.professorId ? parsed.data.professorId : session.user.id;

        const professor = await prisma.user.findUnique({
            where: { id: professorId },
            select: { id: true, isActive: true },
        });

        if (!professor || !professor.isActive) {
            return NextResponse.json({ message: "Professor responsável não encontrado" }, { status: 404 });
        }

        const course = await prisma.course.create({
            data: {
                title: parsed.data.titulo,
                description: parsed.data.descricao,
                workload: parsed.data.cargaHoraria,
                isActive: parsed.data.ativo ?? true,
                professorId,
            },
            include: {
                professor: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(course, { status: 201 });
    } catch {
        return NextResponse.json(
            {
                message: "Erro ao criar curso",
            },
            { status: 500 }
        );
    }
}
