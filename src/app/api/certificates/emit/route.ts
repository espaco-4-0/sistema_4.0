import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { emitCertificateSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { emitCertificate } from "@/src/infra/modules/certificates/certificates.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;
        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const body = await request.json();
        const parsed = emitCertificateSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
        const result = await emitCertificate(parsed.data, user.id);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";
        return NextResponse.json({ message }, { status: 400 });
    }
}
