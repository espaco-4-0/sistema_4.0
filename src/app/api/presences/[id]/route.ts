import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { updatePresenceSchema } from "@/src/infra/modules/presences/[id]/presence-id.schema";
import {
    buildPresenceUpdateData,
    findUserPresenceById,
    updatePresenceById,
} from "@/src/infra/modules/presences/[id]/presence-id.service";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ message: "ID invalido" }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Body invalido" }, { status: 400 });
    }

    const validated = updatePresenceSchema.safeParse(body);
    if (!validated.success) {
        return NextResponse.json({ message: validated.error.issues[0]?.message ?? "Dados invalidos" }, { status: 400 });
    }

    const { situation } = validated.data;

    try {
        const current = await findUserPresenceById(id, userId);

        if (!current) {
            return NextResponse.json({ message: "Presenca nao encontrada" }, { status: 404 });
        }

        const updateData = buildPresenceUpdateData(situation);

        const updated = await updatePresenceById(id, updateData);

        return NextResponse.json({ message: "Presenca atualizada com sucesso", data: updated });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error({ err, route: getRequestInfo(request) }, errorMessage);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
