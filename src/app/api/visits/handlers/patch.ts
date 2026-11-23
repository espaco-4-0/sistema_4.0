import { executeVisitPatchAction, isAdmin } from "@/src/infra/modules/visits/visits.service";
import { ForbiddenError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as { id: string; role: string };
}

export async function patchHandlers(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !isAdmin(user.role)) {
            throw new ForbiddenError("Acesso negado");
        }

        const body = (await req.json()) as { id?: number; action?: string; reason?: string };
        const updated = await executeVisitPatchAction(body);
        return NextResponse.json(updated);
    } catch (error) {
        return handleError(error);
    }
}
