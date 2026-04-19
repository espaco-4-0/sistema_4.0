import { prisma } from "@/src/ui/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
    try {
        const { slug } = await params;

        if (!slug?.trim()) {
            return NextResponse.json({ error: "Slug inválido" }, { status: 422 });
        }

        const post = await prisma.post.findFirst({
            where: {
                slug,
                publicado: true,
            },
            include: {
                fotos: {
                    select: { url: true },
                },
                categorias: {
                    select: { nome: true },
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
