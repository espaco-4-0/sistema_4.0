import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { listIssuancesSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { listIssuances } from "@/src/infra/modules/certificates/issuances.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const searchParams = req.nextUrl.searchParams;
        const parsed = listIssuancesSchema.safeParse({
            page: searchParams.get("page") ?? undefined,
            limit: searchParams.get("limit") ?? undefined,
            search: searchParams.get("search") ?? undefined,
            status: searchParams.get("status") ?? undefined,
        });

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Parâmetros inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const result = await listIssuances(parsed.data);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("[GET /api/certificates/issuances]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
