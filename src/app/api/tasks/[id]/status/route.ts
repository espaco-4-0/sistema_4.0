import { awardForEvent } from "@/src/infra/modules/gamification/rules.service";
import { taskStatusSchema } from "@/src/infra/modules/projects/projects.schema";
import { canManageProject, getTask, updateTask } from "@/src/infra/modules/projects/projects.service";
import { readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

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
            return NextResponse.json({ message: "Sem permissão para alterar esta tarefa" }, { status: 403 });
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = taskStatusSchema.safeParse(parsedBody.body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updated = await updateTask(id, { status: parsed.data.status }, task.progress);

        // Pontua só quem executou a tarefa, e só ao concluí-la.
        const gamification =
            parsed.data.status === "DONE" && updated.assignedToId
                ? await awardForEvent(updated.assignedToId, "TASK_COMPLETED")
                : null;

        return NextResponse.json({ ...updated, gamification }, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/tasks/[id]/status]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
