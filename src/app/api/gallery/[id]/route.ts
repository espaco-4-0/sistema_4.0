import { deleteGalleryItemById, updateGalleryItemById } from "@/src/infra/modules/gallery/gallery-server.service";
import { updateGalleryActiveSchema } from "@/src/infra/modules/gallery/gallery.schema";
import { ForbiddenError, UnauthorizedError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const { id } = await params;
        const body = await req.json();

        const validatedData = updateGalleryActiveSchema.parse(body);
        const result = await updateGalleryItemById(id, validatedData);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const { id } = await params;
        const result = await deleteGalleryItemById(id);

        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}
