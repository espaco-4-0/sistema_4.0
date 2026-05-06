import { prisma } from "@/src/infra/data/prisma";
import { sendResetPasswordEmail } from "@/src/lib/email";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "E-mail é obrigatório" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            const secretKey = process.env.JWT_SECRET;
            if (!secretKey) throw new Error("JWT_SECRET não definido no .env");

            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: token,
                    resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hora
                },
            });

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            const resetLink = `${baseUrl}/reset-password?token=${token}`;

            await sendResetPasswordEmail(user.email, user.nomeCompleto ?? "Usuário", resetLink);
        }

        return NextResponse.json(
            {
                message: "Se o e-mail estiver cadastrado, um link de recuperação foi enviado.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro no servidor:", error);
        return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
    }
}
