import { getUserGamification } from "@/src/infra/modules/gamification/gamification.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const data = await getUserGamification(session.user.id);

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/gamification/me]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
