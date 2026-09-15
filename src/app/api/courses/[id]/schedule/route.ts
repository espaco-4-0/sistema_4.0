import {
    findCourseForEdit,
    findCourseSchedule,
    findInvalidScheduleLocations,
    replaceCourseAgenda,
} from "@/src/infra/modules/courses/course-admin.service";
import { replaceAgendaSchema } from "@/src/infra/modules/courses/courses.schema";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        const course = await findCourseForEdit(courseId);
        if (!course) throw new NotFoundError("Curso", courseId);

        const agenda = await findCourseSchedule(courseId);

        return NextResponse.json({ data: agenda }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            throw new ForbiddenError("Sem permissão para editar a agenda");
        }

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        const course = await findCourseForEdit(courseId);
        if (!course) throw new NotFoundError("Curso", courseId);

        if (session.user.role === "PROFESSOR" && course.professorId !== session.user.id) {
            throw new ForbiddenError("Sem permissão para editar este curso");
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            throw new ValidationError("Body invalido");
        }

        const parsed = replaceAgendaSchema.safeParse(body);
        if (!parsed.success) throw parsed.error;

        const invalidLocations = await findInvalidScheduleLocations(parsed.data.agenda);
        if (invalidLocations.length > 0) {
            throw new ValidationError("Local invalido ou inativo na agenda");
        }

        const updated = await replaceCourseAgenda(courseId, parsed.data.agenda);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}