import { createBadgeSchema } from "@/src/infra/modules/gamification/gamification.schema";
import { listBadges } from "@/src/infra/modules/gamification/gamification.service";
import { createBadge } from "@/src/infra/modules/gamification/rules.service";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
                    name: badge.name,
                    description: badge.description,
                    iconUrl: badge.iconUrl,
                    points: badge.points,
                    totalEarned: badge._count.userBadges,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/gamification/badges]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        if (!["ADMIN", "PROFESSOR"].includes(session.user.role)) {
            return NextResponse.json({ message: "Sem permissão para criar badges" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = createBadgeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const badge = await createBadge(parsed.data);

        return NextResponse.json(badge, { status: 201 });
    } catch (err) {
        if (err instanceof Error && err.message.includes("Unique constraint")) {
            return NextResponse.json({ message: "Já existe uma badge com esse nome" }, { status: 409 });
        }

        console.error("[POST /api/gamification/badges]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
