import { getLeaderboard } from "@/src/infra/modules/gamification/gamification.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const limitParam = req.nextUrl.searchParams.get("limit");
        const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

        if (Number.isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
            return NextResponse.json(
                { message: `Parâmetro 'limit' deve estar entre 1 e ${MAX_LIMIT}` },
                { status: 400 }
            );
        }

        const data = await getLeaderboard(limit);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/gamification/leaderboard]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
