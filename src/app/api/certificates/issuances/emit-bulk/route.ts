import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { emitBulkSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { emitBatchCertificates } from "@/src/infra/modules/certificates/certificates.service";
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

        const parsed = emitBulkSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const issuances = await resolveIssuances(parsed.data.issuanceIds);
        if (issuances.length === 0) {
            return NextResponse.json({ message: "Nenhuma matrícula encontrada" }, { status: 404 });
        }

        // O lote é agrupado por curso porque emitBatchCertificates recebe um curso só.
        const porCurso = new Map<string, string[]>();
        issuances.forEach((issuance) => {
            porCurso.set(issuance.curso, [...(porCurso.get(issuance.curso) ?? []), issuance.alunoId]);
        });

        const resultados = [];
        for (const [curso, alunoIds] of porCurso) {
            const resultado = await emitBatchCertificates(
                { templateId: parsed.data.templateId, alunoIds, curso },
                user.id
            );
            resultados.push({ curso, ...resultado });
        }

        return NextResponse.json({ resultados }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/certificates/issuances/emit-bulk]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
