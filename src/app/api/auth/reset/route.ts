import { resetPasswordWithToken } from "@/src/infra/modules/auth/auth-server.service";
import { resetPasswordSchema } from "@/src/infra/modules/auth/auth.schema";
import { ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const parsed = resetPasswordSchema.safeParse(body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? "Token e nova senha são obrigatórios");
        }

        await resetPasswordWithToken(parsed.data.token, parsed.data.novaSenha);

        return NextResponse.json({ message: "Senha redefinida com sucesso" }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}
