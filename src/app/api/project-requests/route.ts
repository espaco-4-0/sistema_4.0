import {
    createProjectRequest,
    findInvalidUserIds,
    listProjectRequests,
} from "@/src/infra/modules/projects/project-requests.service";
import { createProjectRequestSchema } from "@/src/infra/modules/projects/projects.schema";
import { readJsonBody, requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export async function GET(req: NextRequest) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const status = req.nextUrl.searchParams.get("status")?.trim().toUpperCase();
        if (status && !REQUEST_STATUSES.includes(status)) {
            return NextResponse.json({ message: "Parâmetro 'status' inválido" }, { status: 400 });
        }

        const isReviewer = user.role === "ADMIN" || user.role === "PROFESSOR";

        const requests = await listProjectRequests({
            status,
            ...(isReviewer ? {} : { createdById: user.id }),
        });

        return NextResponse.json({ data: requests }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/project-requests]", error);
        return NextResponse.json({ message: "Erro interno ao listar solicitações" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const parsedBody = await readJsonBody(req);
        if (parsedBody.response) return parsedBody.response;

        const parsed = createProjectRequestSchema.safeParse(parsedBody.body);
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

        const created = await createProjectRequest(parsed.data, user.id);

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("[POST /api/project-requests]", error);
        return NextResponse.json({ message: "Erro ao criar solicitação" }, { status: 500 });
    }
}
