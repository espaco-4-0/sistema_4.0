import { listEnabledResourcesForUser } from "@/src/infra/modules/courses/course-admin.service";
import { COURSE_RESOURCES } from "@/src/infra/modules/courses/courses.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

/**
 * Recursos que o usuário logado pode acessar, resultado da união dos acessos
 * configurados nos cursos ativos em que ele está matriculado.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const enabled = await listEnabledResourcesForUser(session.user.id);
        const enabledSet = new Set<string>(enabled);

        return NextResponse.json(
            {
                data: {
                    enabled,
                    all: COURSE_RESOURCES.map((resource) => ({
                        recurso: resource,
                        liberado: enabledSet.has(resource),
                    })),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/profile/me/access]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
