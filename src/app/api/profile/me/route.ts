import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { updateProfileSchema } from "@/src/infra/modules/profile/me/profile-me.schema";
import {
    emailExistsForAnotherProfile,
    getProfileById,
    updateProfileById,
} from "@/src/infra/modules/profile/me/profile-me.service";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function requireUser() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    }
    return { userId };
}

export async function GET(request: NextRequest) {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    try {
        const profile = await getProfileById(auth.userId);

        if (!profile) {
            return NextResponse.json({ message: "Usuario nao encontrado" }, { status: 404 });
        }

        return NextResponse.json({ data: profile });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error({ err, route: getRequestInfo(request) }, errorMessage);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const auth = await requireUser();
    if ("error" in auth) return auth.error;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Body invalido" }, { status: 400 });
    }

    const validated = updateProfileSchema.safeParse(body);
    if (!validated.success) {
        return NextResponse.json({ message: validated.error.issues[0]?.message ?? "Dados invalidos" }, { status: 400 });
    }

    const payload = validated.data;
    if (Object.keys(payload).length === 0) {
        return NextResponse.json({ message: "Nenhum campo para atualizar" }, { status: 400 });
    }

    try {
        if (payload.email) {
            const existing = await emailExistsForAnotherProfile(auth.userId, payload.email);

            if (existing) {
                return NextResponse.json({ message: "Email ja cadastrado" }, { status: 409 });
            }
        }

        const updated = await updateProfileById(auth.userId, payload);

        return NextResponse.json({ message: "Perfil atualizado com sucesso", data: updated });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error({ err, route: getRequestInfo(request) }, errorMessage);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
