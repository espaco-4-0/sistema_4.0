import { patchUserSchema } from "@/src/infra/modules/users/[id]/user-id.schema";
import {
    emailExistsForAnotherUser,
    isPrismaNotFoundError,
    updateUserById,
} from "@/src/infra/modules/users/[id]/user-id.service";
import { requireAdmin } from "@/src/ui/lib/auth";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Body inválido" }, { status: 400 });
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
        return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const validated = patchUserSchema.safeParse(body);

    if (!validated.success) {
        return NextResponse.json({ message: validated.error.issues[0]?.message ?? "Dados invalidos" }, { status: 400 });
    }

    const data = validated.data;

    try {
        if (data.email) {
            const existingByEmail = await emailExistsForAnotherUser(id, data.email);

            if (existingByEmail) {
                return NextResponse.json({ message: "Email ja cadastrado" }, { status: 409 });
            }
        }

        const updated = await updateUserById(id, data);

        return NextResponse.json({ message: "Usuario atualizado com sucesso", data: updated });
    } catch (err) {
        if (isPrismaNotFoundError(err)) {
            return NextResponse.json({ message: "Usuario nao encontrado" }, { status: 404 });
        }

        logger.error({ err, route: getRequestInfo(request) }, getErrorMessage(err));
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
