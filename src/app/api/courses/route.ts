import {
    createCourse,
    findInvalidScheduleLocations,
    findUserForValidation,
    listCourses,
} from "@/src/infra/modules/courses/course-admin.service";
import { createCourseSchema } from "@/src/infra/modules/courses/courses.schema";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const q = searchParams.get("q")?.trim();
        const professorId = searchParams.get("professorId")?.trim();
        const ativoParam = searchParams.get("ativo")?.trim().toLowerCase();

        const isActive =
            ativoParam === "true" ? true : ativoParam === "false" ? false : ativoParam ? "invalid" : undefined;
        if (isActive === "invalid") throw new ValidationError("Parametro 'ativo' invalido");

        const courses = await listCourses({
            q,
            professorId,
            isActive: typeof isActive === "boolean" ? isActive : undefined,
        });

        return NextResponse.json({ data: courses }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            throw new ForbiddenError("Sem permissão para criar cursos");
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            throw new ValidationError("Body invalido");
        }

        const parsed = createCourseSchema.safeParse(body);
        if (!parsed.success) throw parsed.error;

        const professorId =
            session.user.role === "ADMIN" && parsed.data.professorId ? parsed.data.professorId : session.user.id;

        const professor = await findUserForValidation(professorId);
        if (!professor || !professor.isActive) throw new NotFoundError("Professor responsavel");

        if (professor.role !== "PROFESSOR" && professor.role !== "ADMIN") {
            throw new ValidationError("O responsavel pelo curso deve ser um professor ou administrador");
        }

        if (parsed.data.agenda?.length) {
            const invalidLocations = await findInvalidScheduleLocations(parsed.data.agenda);
            if (invalidLocations.length > 0) {
                throw new ValidationError("Local invalido ou inativo na agenda");
            }
        }

        const course = await createCourse(parsed.data, professorId);

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
