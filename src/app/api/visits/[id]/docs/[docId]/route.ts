import { getVisitDocumentDownloadUrl, isAdmin } from "@/src/infra/modules/visits/visits.service";
import { ForbiddenError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as { role: string };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
    try {
        const user = await getSessionUser();

        if (!user || !isAdmin(user.role)) {
            throw new ForbiddenError("Acesso negado");
        }

        const { docId: docIdParam } = await params;
        const docId = parseInt(docIdParam, 10);

        const signedUrl = await getVisitDocumentDownloadUrl(docId);

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        return handleError(error);
    }
}
