import {
    getOverviewAlerts,
    getOverviewMetrics,
    getOverviewSeries,
} from "@/src/infra/modules/dashboard/dashboard.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

const ALLOWED_ROLES = ["ADMIN", "PROFESSOR"];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (!ALLOWED_ROLES.includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para ver o painel" }, { status: 403 });
        }

        const [metrics, series, alerts] = await Promise.all([
            getOverviewMetrics(),
            getOverviewSeries(),
            getOverviewAlerts(),
        ]);

        return NextResponse.json({ data: { metrics, series, alerts } }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/dashboard/overview]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
