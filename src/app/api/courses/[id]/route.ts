import { patchCourseSchema } from "@/src/infra/modules/courses/courses.schema";
import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const id = params.id?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.curso.findUnique({
            where: { id },
            include: {
                professor: {
                    select: {
                        id: true,
                        nomeCompleto: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        aulas: true,
                        inscricoes: true,
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        return NextResponse.json(course, { status: 200 });
    } catch (error) {
        console.error("[GET /api/courses/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

// pelo que entendi quando estava lendo na doc: o PATCH serve para que atualize parcialmente ao inves de ter que ir atualizando tudo
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para editar cursos" }, { status: 403 });
        }

        const id = params.id?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const existingCourse = await prisma.curso.findUnique({
            where: { id },
            select: { id: true, professorId: true },
        });
        if (!existingCourse) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        if (session.user.role === "PROFESSOR" && existingCourse.professorId !== session.user.id) {
            return NextResponse.json({ message: "Sem permissão para editar este curso" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = patchCourseSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        if (parsed.data.professorId && session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem trocar o professor" }, { status: 403 });
        }

        const updated = await prisma.curso.update({
            where: { id },
            data: {
                ...parsed.data,
            },
            include: {
                professor: {
                    select: {
                        id: true,
                        nomeCompleto: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        aulas: true,
                        inscricoes: true,
                    },
                },
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/courses/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem excluir cursos" }, { status: 403 });
        }

        const id = params.id?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const exists = await prisma.curso.findUnique({ where: { id } });
        if (!exists) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        await prisma.curso.delete({ where: { id } });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/courses/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
