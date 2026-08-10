import { prisma } from "@/src/infra/data/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "../../../auth/[...nextauth]/route";

const SALT_ROUNDS = 12;

const changePasswordSchema = z
    .object({
        senhaAtual: z.string().min(1, "Informe a senha atual"),
        novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres").max(64),
        confirmarSenha: z.string().min(1, "Confirme a nova senha"),
    })
    .refine((data) => data.novaSenha === data.confirmarSenha, {
        message: "As senhas não coincidem",
        path: ["confirmarSenha"],
    })
    .refine((data) => data.novaSenha !== data.senhaAtual, {
        message: "A nova senha deve ser diferente da atual",
        path: ["novaSenha"],
    });

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: "Body inválido" }, { status: 400 });
        }

        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true },
        });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }

        const senhaConfere = await bcrypt.compare(parsed.data.senhaAtual, user.password);
        if (!senhaConfere) {
            return NextResponse.json({ message: "Senha atual incorreta" }, { status: 403 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash(parsed.data.novaSenha, SALT_ROUNDS) },
        });

        return NextResponse.json({ message: "Senha alterada com sucesso" }, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/profile/me/password]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
