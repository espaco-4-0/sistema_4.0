import { awardForEvent } from "@/src/infra/modules/gamification/rules.service";
import { enrollUser, unenrollUser } from "@/src/infra/modules/courses/enrollment.service";
import { UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        const subscription = await enrollUser(session.user.id, courseId);
        const gamification = await awardForEvent(session.user.id, "COURSE_ENROLLED");

        return NextResponse.json(
            { message: "Inscricao realizada com sucesso", subscription, gamification },
            { status: 201 }
        );
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError();

        const { id: rawId } = await params;
        const courseId = rawId?.trim();
        if (!courseId) throw new ValidationError("ID invalido");

        await unenrollUser(session.user.id, courseId);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleError(error);
    }
}