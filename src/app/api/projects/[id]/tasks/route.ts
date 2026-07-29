import { findInvalidUserIds } from "@/src/infra/modules/projects/project-requests.service";
import { TASK_STATUSES, createTaskSchema } from "@/src/infra/modules/projects/projects.schema";
import { canManageProject, createTask, getProject, listTasks } from "@/src/infra/modules/projects/projects.service";
import { readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    try {
        const { response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const projectId = rawId?.trim();
        if (!projectId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        const status = req.nextUrl.searchParams.get("status")?.trim().toUpperCase();
        if (status && !TASK_STATUSES.includes(status as never)) {
            return NextResponse.json({ message: "Parâmetro 'status' inválido" }, { status: 400 });
        }

        const tasks = await listTasks(projectId, status);

        return NextResponse.json({ data: tasks }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/projects/[id]/tasks]", error);
        return NextResponse.json({ message: "Erro interno ao listar tarefas" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const projectId = rawId?.trim();
        if (!projectId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        if (!(await canManageProject(projectId, user.id, user.role))) {
            return NextResponse.json({ message: "Sem permissão para criar tarefas neste projeto" }, { status: 403 });
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = createTaskSchema.safeParse(parsedBody.body);
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

        const task = await createTask(projectId, parsed.data);

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("[POST /api/projects/[id]/tasks]", error);
        return NextResponse.json({ message: "Erro ao criar tarefa" }, { status: 500 });
    }
}
