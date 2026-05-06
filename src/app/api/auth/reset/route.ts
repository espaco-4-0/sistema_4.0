import { prisma } from "@/src/infra/data/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, novaSenha } = body;

        if (!token || !novaSenha) {
            return NextResponse.json({ message: "Token e nova senha são obrigatórios" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Token inválido ou expirado. Solicite um novo link." },
                { status: 400 }
            );
        }

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                senha: senhaHash,
                resetToken: null,
                resetTokenExpiresAt: null,
            },
        });

        return NextResponse.json({ message: "Senha redefinida com sucesso" }, { status: 200 });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
    }
}
