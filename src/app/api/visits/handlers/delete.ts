import { deleteVisitById, isAdmin } from "@/src/infra/modules/visits/visits.service";
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

export async function deleteHandlers(req: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !isAdmin(user.role)) {
            throw new ForbiddenError("Acesso negado");
        }

        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));

        const result = await deleteVisitById(id);
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}
