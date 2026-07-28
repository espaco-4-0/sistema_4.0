import {
    findInvalidUserIds,
    getProjectRequest,
    updateProjectRequest,
} from "@/src/infra/modules/projects/project-requests.service";
import { patchProjectRequestSchema } from "@/src/infra/modules/projects/projects.schema";
import { readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const request = await getProjectRequest(id);
        if (!request) {
            return NextResponse.json({ message: "Solicitação não encontrada" }, { status: 404 });
        }

        const isReviewer = user.role === "ADMIN" || user.role === "PROFESSOR";
        const isParticipant =
            request.createdById === user.id || request.members.some((member) => member.userId === user.id);

        if (!isReviewer && !isParticipant) {
            return NextResponse.json({ message: "Sem permissão para ver esta solicitação" }, { status: 403 });
        }

        return NextResponse.json(request, { status: 200 });
    } catch (error) {
        console.error("[GET /api/project-requests/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

/** Edição/reenvio pelo autor. Solicitação aprovada não volta a ser editável. */
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
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

        if (existing.createdById !== user.id && user.role !== "ADMIN") {
            return NextResponse.json({ message: "Apenas o autor pode editar a solicitação" }, { status: 403 });
        }

        if (existing.status === "APPROVED") {
            return NextResponse.json(
                { message: "Solicitação já aprovada não pode ser editada. Edite o projeto gerado." },
                { status: 409 }
            );
        }

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = patchProjectRequestSchema.safeParse(parsedBody.body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        if (parsed.data.integrantes?.length) {
            const invalid = await findInvalidUserIds(parsed.data.integrantes.map((member) => member.userId));

            if (invalid.length > 0) {
                return NextResponse.json(
                    { message: "Integrante inexistente ou inativo", errors: { integrantes: invalid } },
                    { status: 422 }
                );
            }
        }

        const updated = await updateProjectRequest(id, parsed.data);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/project-requests/[id]]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
