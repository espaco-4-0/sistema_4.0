import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { patchBadgeSchema } from "@/src/infra/modules/gamification/gamification.schema";
import { deleteBadge, updateBadge } from "@/src/infra/modules/gamification/rules.service";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const { id } = await params;
        if (!id?.trim()) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = patchBadgeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(await updateBadge(id, parsed.data), { status: 200 });
    } catch (err) {
        console.error("[PUT /api/gamification/badges/[id]]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin");
        if (roleError) return roleError;

        const { id } = await params;
        if (!id?.trim()) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

        await deleteBadge(id);

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("[DELETE /api/gamification/badges/[id]]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
