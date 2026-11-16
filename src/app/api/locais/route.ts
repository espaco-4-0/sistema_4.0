import {
    createLocalSchema,
    deleteLocalQuerySchema,
    listLocaisQuerySchema,
    updateLocalSchema,
} from "@/src/infra/modules/locais/locais.schema";
import {
    createLocalRecord,
    deleteLocalRecord,
    listLocais,
    mapLocationToFrontend,
    updateLocalRecord,
} from "@/src/infra/modules/locais/locais.service";
import { ForbiddenError, UnauthorizedError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export { mapLocationToFrontend };

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;
        const validatedQuery = listLocaisQuerySchema.parse({
            includeInactive: searchParams.get("includeInactive") ?? undefined,
            q: searchParams.get("q") ?? undefined,
        });

        if (validatedQuery.includeInactive) {
            const session = await getServerSession(authOptions);
            if (!session) throw new UnauthorizedError("Não autenticado");
            if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");
        }

        const mappedLocais = await listLocais(validatedQuery);

        return NextResponse.json({ data: mappedLocais }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const validatedBody = createLocalSchema.parse((await req.json()) ?? {});

        const created = await createLocalRecord(validatedBody);

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const validatedBody = updateLocalSchema.parse((await req.json()) ?? {});

        const updated = await updateLocalRecord(validatedBody);

        return NextResponse.json({ data: updated }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const url = new URL(req.url);
        const validatedQuery = deleteLocalQuerySchema.parse({
            id: url.searchParams.get("id"),
        });

        const result = await deleteLocalRecord(validatedQuery.id);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}
