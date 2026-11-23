import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { getCertificateMetrics } from "@/src/infra/modules/certificates/issuances.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const metrics = await getCertificateMetrics();

        return NextResponse.json(metrics, { status: 200 });
    } catch (err) {
        console.error("[GET /api/certificates/metrics]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
