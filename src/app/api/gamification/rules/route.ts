import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { saveRulesSchema } from "@/src/infra/modules/gamification/gamification.schema";
import { listRules, saveRules } from "@/src/infra/modules/gamification/rules.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        return NextResponse.json({ data: await listRules() }, { status: 200 });
    } catch (err) {
        console.error("[GET /api/gamification/rules]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
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

        const parsed = saveRulesSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        return NextResponse.json({ data: await saveRules(parsed.data.rules) }, { status: 200 });
    } catch (err) {
        console.error("[PUT /api/gamification/rules]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
