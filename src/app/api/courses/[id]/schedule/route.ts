import { prisma } from "@/src/infra/data/prisma";
import { findInvalidScheduleLocations, replaceCourseAgenda } from "@/src/infra/modules/courses/course-admin.service";
import { replaceAgendaSchema } from "@/src/infra/modules/courses/courses.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        const agenda = await prisma.courseSchedule.findMany({
            where: { courseId },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            include: { location: { select: { id: true, name: true } } },
        });

        return NextResponse.json({ data: agenda }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/courses/[id]/schedule]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para editar a agenda" }, { status: 403 });
        }

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, professorId: true },
        });

        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        if (session.user.role === "PROFESSOR" && course.professorId !== session.user.id) {
            return NextResponse.json({ message: "Sem permissão para editar este curso" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = replaceAgendaSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const invalidLocations = await findInvalidScheduleLocations(parsed.data.agenda);
        if (invalidLocations.length > 0) {
            return NextResponse.json(
                { message: "Local inválido ou inativo na agenda", errors: { agenda: invalidLocations } },
                { status: 422 }
            );
        }

        const updated = await replaceCourseAgenda(courseId, parsed.data.agenda);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/courses/[id]/schedule]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
