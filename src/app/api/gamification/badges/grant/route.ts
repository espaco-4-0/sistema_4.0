import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { grantBadgeSchema } from "@/src/infra/modules/gamification/gamification.schema";
import { grantBadgeManually } from "@/src/infra/modules/gamification/rules.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = grantBadgeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const granted = await grantBadgeManually(parsed.data.userId, parsed.data.badgeId);

        return NextResponse.json(granted, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";

        if (message.includes("não encontrada")) return NextResponse.json({ message }, { status: 404 });
        if (message.includes("já possui")) return NextResponse.json({ message }, { status: 409 });

        console.error("[POST /api/gamification/badges/grant]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
