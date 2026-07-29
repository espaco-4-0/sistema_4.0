import { listBadges } from "@/src/infra/modules/gamification/gamification.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        const badges = await listBadges();

        return NextResponse.json(
            {
                data: badges.map((badge) => ({
                    id: badge.id,
                    nome: badge.name,
                    descricao: badge.description,
                    iconUrl: badge.iconUrl,
                    pontos: badge.points,
                    totalConquistas: badge._count.userBadges,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/gamification/badges]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
