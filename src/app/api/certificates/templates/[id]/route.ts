import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { patchTemplateSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { deleteTemplate, updateTemplate } from "@/src/infra/modules/certificates/certificates.service";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const { id } = await params;
        if (!id?.trim()) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = patchTemplateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const updated = await updateTemplate(id, user.id, parsed.data, user.role.toUpperCase() === "ADMIN");

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";

        if (message.includes("não encontrado")) return NextResponse.json({ message }, { status: 404 });
        if (message.includes("Sem permissão")) return NextResponse.json({ message }, { status: 403 });

        console.error("[PUT /api/certificates/templates/[id]]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const { id } = await params;
        if (!id?.trim()) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        await deleteTemplate(id);

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";
        if (message.includes("não encontrado")) return NextResponse.json({ message }, { status: 404 });

        console.error("[DELETE /api/certificates/templates/[id]]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
