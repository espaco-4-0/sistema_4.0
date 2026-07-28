import { prisma } from "@/src/infra/data/prisma";
import {
    COURSE_ADMIN_INCLUDE,
    deleteCourse,
    findInvalidScheduleLocations,
    getCourseDeletionBlockers,
    updateCourse,
} from "@/src/infra/modules/courses/course-admin.service";
import { patchCourseSchema } from "@/src/infra/modules/courses/courses.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id },
            include: COURSE_ADMIN_INCLUDE,
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

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const existingCourse = await prisma.course.findUnique({
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

        if (parsed.data.professorId) {
            const professor = await prisma.user.findUnique({
                where: { id: parsed.data.professorId },
                select: { id: true, isActive: true, role: true },
            });

            if (!professor || !professor.isActive) {
                return NextResponse.json({ message: "Professor responsável não encontrado" }, { status: 404 });
            }

            if (professor.role !== "PROFESSOR" && professor.role !== "ADMIN") {
                return NextResponse.json(
                    { message: "O responsável pelo curso deve ser um professor ou administrador" },
                    { status: 422 }
                );
            }
        }

        if (parsed.data.agenda?.length) {
            const invalidLocations = await findInvalidScheduleLocations(parsed.data.agenda);

            if (invalidLocations.length > 0) {
                return NextResponse.json(
                    { message: "Local inválido ou inativo na agenda", errors: { agenda: invalidLocations } },
                    { status: 422 }
                );
            }
        }

        const updated = await updateCourse(id, parsed.data, parsed.data.professorId);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/courses/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem excluir cursos" }, { status: 403 });
        }

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const exists = await prisma.course.findUnique({ where: { id }, select: { id: true } });
        if (!exists) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        // Excluir um curso com histórico apaga em cascata as matrículas dos alunos.
        // Só permitimos com ?force=true; o caminho recomendado é inativar (PATCH { ativo: false }).
        const force = req.nextUrl.searchParams.get("force") === "true";
        const blockers = await getCourseDeletionBlockers(id);

        if (!force && (blockers.lessons > 0 || blockers.enrollments > 0)) {
            return NextResponse.json(
                {
                    message:
                        "Curso possui aulas ou matrículas vinculadas. Inative-o (PATCH { ativo: false }) ou repita com ?force=true.",
                    blockers,
                },
                { status: 409 }
            );
        }

        await deleteCourse(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/courses/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
