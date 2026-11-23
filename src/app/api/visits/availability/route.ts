import { getVisitAvailability, handleAvailabilityAction } from "@/src/infra/modules/visits/visits-availability.service";
import { ForbiddenError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as { id?: string; role?: string };
}

export async function GET() {
    try {
        const result = await getVisitAvailability();
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || user.role !== "ADMIN") {
            throw new ForbiddenError("Acesso não autorizado");
        }

        const body = (await req.json()) as Record<string, unknown>;
        const result = await handleAvailabilityAction(body);
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}
