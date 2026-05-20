import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        const postId = (await params).id;
        const validatedPostId = postIdBlogSchema.safeParse(postId);
        if (!validatedPostId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: validatedPostId.data,
                },
            },
        });

        return NextResponse.json({ status: 200 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2003")
                return NextResponse.json({ error: "Usuário ou Post não encontrado" }, { status: 409 });

            if (err.code === "P2025")
                return NextResponse.json(
                    { error: "Não é possível excluir uma curtida que não existe" },
                    { status: 409 }
                );
        }
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
