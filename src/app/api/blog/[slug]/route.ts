import { prisma } from "@/src/infra/data/prisma";
import { postSlugBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

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
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        return NextResponse.json({ data: post }, { status: 200 });
    } catch (err) {
        console.error("Internal Error: ", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
