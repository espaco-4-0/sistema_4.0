import { getReports } from "@/src/infra/modules/reports/reports.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

const ALLOWED_ROLES = ["ADMIN", "PROFESSOR"];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (!ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para ver relatórios" }, { status: 403 });
        }

        const data = await getReports();

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/reports]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
