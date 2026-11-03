import { requestPasswordRecovery } from "@/src/infra/modules/auth/auth-server.service";
import { recoveryPasswordSchema } from "@/src/infra/modules/auth/auth.schema";
import { ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = recoveryPasswordSchema.safeParse(body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? "E-mail é obrigatório");
        }

        await requestPasswordRecovery(parsed.data.email);

        return NextResponse.json(
            { message: "Se o e-mail estiver cadastrado, um link de recuperação foi enviado." },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}
