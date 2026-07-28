import { findInvalidUserIds } from "@/src/infra/modules/projects/project-requests.service";
import { patchTaskSchema } from "@/src/infra/modules/projects/projects.schema";
import { canManageProject, deleteTask, getTask, updateTask } from "@/src/infra/modules/projects/projects.service";
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

        const task = await getTask(id);
        if (!task) {
            return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
        }

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error("[GET /api/tasks/[id]]", error);
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

        const task = await getTask(id);
        if (!task) {
            return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
        }

        if (!(await canManageProject(task.projectId, user.id, user.role))) {
            return NextResponse.json({ message: "Sem permissão para editar esta tarefa" }, { status: 403 });
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = patchTaskSchema.safeParse(parsedBody.body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        if (parsed.data.responsavelId) {
            const invalid = await findInvalidUserIds([parsed.data.responsavelId]);

            if (invalid.length > 0) {
                return NextResponse.json({ message: "Responsável inexistente ou inativo" }, { status: 422 });
            }
        }

        const updated = await updateTask(id, parsed.data, task.progress);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/tasks/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const task = await getTask(id);
        if (!task) {
            return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
        }

        if (!(await canManageProject(task.projectId, user.id, user.role))) {
            return NextResponse.json({ message: "Sem permissão para excluir esta tarefa" }, { status: 403 });
        }

        await deleteTask(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/tasks/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
