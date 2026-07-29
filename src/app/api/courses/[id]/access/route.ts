import { prisma } from "@/src/infra/data/prisma";
import { replaceCourseAccess } from "@/src/infra/modules/courses/course-admin.service";
import { COURSE_RESOURCES, replaceAccessSchema } from "@/src/infra/modules/courses/courses.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        const stored = await prisma.courseAccess.findMany({
            where: { courseId },
            select: { resource: true, enabled: true },
        });

        const enabledByResource = new Map(stored.map((entry) => [entry.resource, entry.enabled]));

        const data = COURSE_RESOURCES.map((resource) => ({
            recurso: resource,
            liberado: enabledByResource.get(resource) ?? false,
        }));

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/courses/[id]/access]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas admins podem configurar acessos" }, { status: 403 });
        }

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
            return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = replaceAccessSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updated = await replaceCourseAccess(courseId, parsed.data.acessos);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PUT /api/courses/[id]/access]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
