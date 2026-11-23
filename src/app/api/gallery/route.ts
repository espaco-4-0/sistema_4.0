import { createGalleryItemRecord, listGalleryItems } from "@/src/infra/modules/gallery/gallery-server.service";
import { createGalleryItemSchema, getGalleryItemsSchema } from "@/src/infra/modules/gallery/gallery.schema";
import { ForbiddenError, UnauthorizedError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const paramsOrUndefined = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [key, value === "" ? undefined : value])
        );

        const validatedParams = getGalleryItemsSchema.parse(paramsOrUndefined);
        const session = await getServerSession(authOptions);
        const result = await listGalleryItems(validatedParams, session?.user?.role === "ADMIN");

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const formData = await req.formData();
        const dataObject = Object.fromEntries(formData.entries());
        const validatedData = createGalleryItemSchema.parse(dataObject);

        const newItem = await createGalleryItemRecord(validatedData);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
