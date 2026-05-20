import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { createCategorySchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeAll = searchParams.get("includeAll") === "true";

        const categories = await prisma.postCategory.findMany({
            where: includeAll ? {} : {
                Post: {
                    some: {
                        isPublished: true,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        Post: {
                            where: { isPublished: true },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc"
            }
        });

        const mappedCategories = categories.map((cat: any) => ({
            id: cat.id,
            nome: cat.name,
            _count: {
                posts: cat._count.Post,
            },
        }));

        return NextResponse.json({ data: mappedCategories }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { name } = await req.json();
        const validatedBody = createCategorySchema.safeParse(name);
        if (!validatedBody.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

        await prisma.postCategory.create({
            data: {
                name: validatedBody.data,
            },
        });

        return NextResponse.json({ message: "Categoria criada com sucesso" }, { status: 201 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
            return NextResponse.json({ error: "Já existe categoria com esse nome" }, { status: 409 });
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
