import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { emitSingleSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { emitCertificate } from "@/src/infra/modules/certificates/certificates.service";
import { resolveIssuances } from "@/src/infra/modules/certificates/issuances.service";
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

        const parsed = emitSingleSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const [issuance] = await resolveIssuances([parsed.data.issuanceId]);
        if (!issuance) {
            return NextResponse.json({ message: "Matrícula não encontrada" }, { status: 404 });
        }

        const result = await emitCertificate(
            { templateId: parsed.data.templateId, alunoId: issuance.alunoId, curso: issuance.curso },
            user.id
        );

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro interno";

        // Erros de regra vindos do service (template inativo, já emitido, etc.)
        if (err instanceof Error && /não encontrad|inativo|já/i.test(message)) {
            return NextResponse.json({ message }, { status: 409 });
        }

        console.error("[POST /api/certificates/issuances/emit-single]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
