import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { commentIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        const commentId = (await params).id;

        const validatedCommentId = commentIdBlogSchema.safeParse(commentId);

        if (!validatedCommentId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const comentario = await prisma.comentario.findUnique({
            where: { id: validatedCommentId.data },
        });

        if (!comentario) return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });

        const isAdmin = session.user.role === "ADMIN";
        const isOwner = comentario.autorId === session.user.id;

        if (!isAdmin && !isOwner)
            return NextResponse.json({ error: "Sem permissão para excluir este comentário" }, { status: 403 });

        await prisma.comentario.delete({
            where: { id: validatedCommentId.data },
        });

        return NextResponse.json({ status: 200 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
        }

        console.error(err);

        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
