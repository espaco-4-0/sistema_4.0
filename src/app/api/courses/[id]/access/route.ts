import {
    findCourseAccess,
    findCourseForEdit,
    replaceCourseAccess,
} from "@/src/infra/modules/courses/course-admin.service";
import { COURSE_RESOURCES, replaceAccessSchema } from "@/src/infra/modules/courses/courses.schema";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        const course = await findCourseForEdit(courseId);
        if (!course) throw new NotFoundError("Curso", courseId);

        const stored = await findCourseAccess(courseId);

        const enabledByResource = new Map(stored.map((entry) => [entry.resource, entry.enabled]));
        const data = COURSE_RESOURCES.map((resource) => ({
            recurso: resource,
            liberado: enabledByResource.get(resource) ?? false,
        }));

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        if (session.user.role !== "ADMIN") throw new ForbiddenError("Apenas admins podem configurar acessos");

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        const course = await findCourseForEdit(courseId);
        if (!course) throw new NotFoundError("Curso", courseId);

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            throw new ValidationError("Body invalido");
        }

        const parsed = replaceAccessSchema.safeParse(body);
        if (!parsed.success) throw parsed.error;

        const updated = await replaceCourseAccess(courseId, parsed.data.acessos);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}