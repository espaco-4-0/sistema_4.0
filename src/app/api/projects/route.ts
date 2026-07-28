import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/src/infra/modules/projects/projects.schema";
import { listProjects } from "@/src/infra/modules/projects/projects.service";
import { requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { response } = await requireUser();
        if (response) return response;

        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get("status")?.trim().toUpperCase();
        const type = searchParams.get("tipo")?.trim().toUpperCase();
        const memberId = searchParams.get("membroId")?.trim();
        const search = searchParams.get("q")?.trim();

        if (status && !PROJECT_STATUSES.includes(status as never)) {
            return NextResponse.json({ message: "Parâmetro 'status' inválido" }, { status: 400 });
        }

        if (type && !PROJECT_CATEGORIES.includes(type as never)) {
            return NextResponse.json({ message: "Parâmetro 'tipo' inválido" }, { status: 400 });
        }

        const projects = await listProjects({ status, type, memberId, search });

        return NextResponse.json({ data: projects }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/projects]", error);
        return NextResponse.json({ message: "Erro interno ao listar projetos" }, { status: 500 });
    }
}
