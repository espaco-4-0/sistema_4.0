import { getProjectRequest, rejectProjectRequest } from "@/src/infra/modules/projects/project-requests.service";
import { rejectProjectRequestSchema } from "@/src/infra/modules/projects/projects.schema";
import { REVIEWER_ROLES, readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser(REVIEWER_ROLES);
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const existing = await getProjectRequest(id);
        if (!existing) {
            return NextResponse.json({ message: "Solicitação não encontrada" }, { status: 404 });
        }

        if (existing.status === "APPROVED") {
            return NextResponse.json(
                { message: "Solicitação já aprovada não pode ser rejeitada", projectId: existing.project?.id },
                { status: 409 }
            );
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = rejectProjectRequestSchema.safeParse(parsedBody.body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updated = await rejectProjectRequest(id, user.id, parsed.data.reason, parsed.data.observacoes);

        return NextResponse.json({ message: "Solicitação rejeitada", request: updated }, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/project-requests/[id]/reject]", error);
        return NextResponse.json({ message: "Erro ao rejeitar solicitação" }, { status: 500 });
    }
}
