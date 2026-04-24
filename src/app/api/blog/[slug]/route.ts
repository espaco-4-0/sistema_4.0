import { prisma } from "@/src/infra/data/prisma";
import { postSlugBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const session = await getServerSession(authOptions);

        const post = await prisma.post.findUnique({
            where: {
                slug: validatedSlug.data,
                publicado: true,
            },
            include: {
                fotos: {
                    select: { url: true },
                },
                categorias: {
                    select: { nome: true },
                },
                autor: {
                    select: { nomeCompleto: true },
                },
                _count: {
                    select: { curtidas: true },
                },
                curtidas: session?.user?.id
                    ? {
                          where: {
                              userId: session.user.id,
                          },
                          select: {
                              id: true,
                          },
                      }
                    : false,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        const data = {
            ...post,
            likesCount: post._count.curtidas,
            isLiked: (post as any).curtidas?.length > 0,
        };

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error("Internal Error: ", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
