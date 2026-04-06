import { userRegistrationSchema } from "@/src/ui/forms/schemas/user-registration-schema";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { prisma } from "@/src/ui/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const verifiedBody = userRegistrationSchema.safeParse(body);
        if (!verifiedBody.success) {
            return NextResponse.json(
                { message: verifiedBody.error.issues[0]?.message ?? "Dados inválidos" },
                { status: 400 }
            );
        }
        const { data } = verifiedBody;

        const haveUser = await prisma.user.findUnique({
            where: { email: data.email },
            select: { id: true },
        });

        if (haveUser) {
            return NextResponse.json({ message: "Email já cadastrado" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        await prisma.user.create({
            data: {
                nomeCompleto: data.completeName,
                email: data.email,
                senha: hashedPassword,
                dataNascimento: new Date(data.dateOfBirth),
                telefone: data.telephone,
                raca: data.race,
                educacao: data.education,
                ifalAfiliacao: data.ifalAffiliation,
                deficiencia: data.deficiency ?? null,
                necessidadeEspecial: data.deficiencyNeeds ?? null,
            },
        });

        return NextResponse.json({ message: "Usuário criado com sucesso" }, { status: 201 });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error({ err, route: getRequestInfo(request) }, errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
