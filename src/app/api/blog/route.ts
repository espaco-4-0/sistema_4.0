import { Prisma } from "@/src/generated/prisma/client";
import { getBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { prisma } from "@/src/ui/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const paramsOrUndefined = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [key, value === "" ? undefined : value])
        );

        const validatedData = getBlogSchema.safeParse(paramsOrUndefined);
        if (!validatedData.success)
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });

        const { category, name, includeArchived, quantity } = validatedData.data;

        if (category !== undefined) {
            const categoryEntity = await prisma.postCategoria.findUnique({
                where: {
                    nome: category,
                },
            });

            if (!categoryEntity) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
        }

        if (includeArchived !== undefined) {
            const session = await getServerSession(authOptions);

            if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

            if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const where: Prisma.PostWhereInput = {};
        if (name)
            where.titulo = {
                contains: name,
                mode: "insensitive",
            };

        if (category)
            where.categorias = {
                some: {
                    nome: category,
                },
            };

        if (includeArchived !== undefined) where.publicado = includeArchived;

        const posts = await prisma.post.findMany({
            take: quantity,
            orderBy: { createdAt: "desc" },
            where,
        });

        return NextResponse.json({ data: posts }, { status: 200 });
    } catch (err) {
        console.error("Internal Error: ", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
