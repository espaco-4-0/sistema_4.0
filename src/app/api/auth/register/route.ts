import { registerUser } from "@/src/infra/modules/auth/auth-server.service";
import { userRegistrationSchema } from "@/src/infra/modules/auth/auth.schema";
import { ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const verifiedBody = userRegistrationSchema.safeParse(body);
        if (!verifiedBody.success) {
            throw new ValidationError(verifiedBody.error.issues[0]?.message ?? "Dados inválidos");
        }

        await registerUser(verifiedBody.data);

        return NextResponse.json({ message: "Usuário criado com sucesso" }, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
