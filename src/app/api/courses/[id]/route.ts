import {
    deleteCourse,
    findCourseById,
    findCourseForEdit,
    findInvalidScheduleLocations,
    findUserForValidation,
    getCourseDeletionBlockers,
    updateCourse,
} from "@/src/infra/modules/courses/course-admin.service";
import { patchCourseSchema } from "@/src/infra/modules/courses/courses.schema";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) throw new ValidationError("ID invalido");

        const course = await findCourseById(id);
        if (!course) throw new NotFoundError("Curso", id);

        return NextResponse.json(course, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

// PATCH atualiza parcialmente — sem sobrescrever campos nao enviados
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const allowedRoles = ["ADMIN", "PROFESSOR"];
        if (!allowedRoles.includes(session.user.role)) {
            throw new ForbiddenError("Sem permissão para editar cursos");
        }

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) throw new ValidationError("ID invalido");

        const existingCourse = await findCourseForEdit(id);
        if (!existingCourse) throw new NotFoundError("Curso", id);

        if (session.user.role === "PROFESSOR" && existingCourse.professorId !== session.user.id) {
            throw new ForbiddenError("Sem permissão para editar este curso");
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            throw new ValidationError("Body invalido");
        }

        const parsed = patchCourseSchema.safeParse(body);
        if (!parsed.success) throw parsed.error;

        if (parsed.data.professorId && session.user.role !== "ADMIN") {
            throw new ForbiddenError("Apenas admins podem trocar o professor");
        }

        if (parsed.data.professorId) {
            const professor = await findUserForValidation(parsed.data.professorId);
            if (!professor || !professor.isActive) throw new NotFoundError("Professor responsavel");
            if (professor.role !== "PROFESSOR" && professor.role !== "ADMIN") {
                throw new ValidationError("O responsavel pelo curso deve ser um professor ou administrador");
            }
        }

        if (parsed.data.agenda?.length) {
            const invalidLocations = await findInvalidScheduleLocations(parsed.data.agenda);
            if (invalidLocations.length > 0) {
                throw new ValidationError("Local invalido ou inativo na agenda");
            }
        }

        const updated = await updateCourse(id, parsed.data, parsed.data.professorId);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        if (session.user.role !== "ADMIN") throw new ForbiddenError("Apenas admins podem excluir cursos");

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) throw new ValidationError("ID invalido");

        const exists = await findCourseForEdit(id);
        if (!exists) throw new NotFoundError("Curso", id);

        const force = req.nextUrl.searchParams.get("force") === "true";
        const blockers = await getCourseDeletionBlockers(id);

        if (!force && (blockers.lessons > 0 || blockers.enrollments > 0)) {
            throw new ConflictError(
                `Curso possui ${blockers.lessons} aula(s) e ${blockers.enrollments} matricula(s). ` +
                    "Inative-o (PATCH { ativo: false }) ou repita com ?force=true."
            );
        }

        await deleteCourse(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleError(error);
    }
}