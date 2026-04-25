import { prisma } from "@/src/infra/data/prisma";
import { postSlugBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = 6;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            prisma.comentario.findMany({
                where: {
                    post: {
                        slug: validatedSlug.data,
                    },
                },
                select: {
                    id: true,
                    conteudo: true,
                    createdAt: true,
                    autor: {
                        select: {
                            id: true,
                            nomeCompleto: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.comentario.count({
                where: {
                    post: {
                        slug: validatedSlug.data,
                    },
                },
            }),
        ]);

        return NextResponse.json({
            data: comments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, { status: 200 });
    } catch (err) {
        console.error("Internal Error: ", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
