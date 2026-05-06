import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { postCommentSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        const body = await req.json();

        const validatedPost = postCommentSchema.safeParse(body);
        if (!validatedPost.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

        await prisma.comentario.create({
            data: {
                autorId: session.user.id,
                postId: validatedPost.data.postId,
                conteudo: validatedPost.data.comment,
            },
        });

        return NextResponse.json({ message: "Comentário criado com sucesso" }, { status: 200 });
    } catch (err) {
        console.error(err);

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2003")
                return NextResponse.json({ error: "Usuário ou Post não encontrado" }, { status: 409 });
        }

        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
