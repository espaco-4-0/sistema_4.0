import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { createTemplateSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { createTemplate, listTemplates } from "@/src/infra/modules/certificates/certificates.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    const roleError = requireRole(user.role, "admin", "professor");
    if (roleError) return roleError;

    const templates = await listTemplates(user.id);
    return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;
        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const body = await request.json();
        const parsed = createTemplateSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });

        const template = await createTemplate(parsed.data, user.id);
        return NextResponse.json(template, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";
        return NextResponse.json({ message }, { status: 400 });
    }
}
