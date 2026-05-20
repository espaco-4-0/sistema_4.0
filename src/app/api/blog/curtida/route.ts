import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        const { postId } = await req.json();
        const validatedPostId = postIdBlogSchema.safeParse(postId);
        if (!validatedPostId.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

        await prisma.like.create({
            data: {
                userId: session.user.id,
                postId: validatedPostId.data,
            },
        });

        return NextResponse.json({ message: "Post curtido com sucesso" }, { status: 200 });
    } catch (err) {
        console.error(err);

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2003")
                return NextResponse.json({ error: "Usuário ou Post não encontrado" }, { status: 409 });

            if (err.code === "P2002") return NextResponse.json({ error: "Post já foi curtido" }, { status: 409 });
        }

        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
