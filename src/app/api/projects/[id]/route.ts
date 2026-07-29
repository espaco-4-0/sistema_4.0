import { findInvalidUserIds } from "@/src/infra/modules/projects/project-requests.service";
import { patchProjectSchema } from "@/src/infra/modules/projects/projects.schema";
import { canManageProject, getProject, updateProject } from "@/src/infra/modules/projects/projects.service";
import { readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(id);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error("[GET /api/projects/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(id);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        if (!(await canManageProject(id, user.id, user.role))) {
            return NextResponse.json({ message: "Sem permissão para editar este projeto" }, { status: 403 });
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = patchProjectSchema.safeParse(parsedBody.body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        if (parsed.data.liderId && user.role !== "ADMIN" && user.role !== "PROFESSOR") {
            return NextResponse.json(
                { message: "Apenas admins e professores podem trocar o líder do projeto" },
                { status: 403 }
            );
        }

        const userIdsToCheck = [
            ...(parsed.data.liderId ? [parsed.data.liderId] : []),
            ...(parsed.data.integrantes?.map((member) => member.userId) ?? []),
        ];

        if (userIdsToCheck.length > 0) {
            const invalid = await findInvalidUserIds(userIdsToCheck);

            if (invalid.length > 0) {
                return NextResponse.json(
                    { message: "Usuário inexistente ou inativo", errors: { usuarios: invalid } },
                    { status: 422 }
                );
            }
        }

        const updated = await updateProject(id, parsed.data);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/projects/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
