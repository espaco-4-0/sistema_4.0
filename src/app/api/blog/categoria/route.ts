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

        const categories = await prisma.postCategoria.findMany({
            where: includeAll ? {} : {
                posts: {
                    some: {
                        publicado: true,
                    },
                },
            },
            select: {
                id: true,
                nome: true,
                _count: {
                    select: {
                        posts: {
                            where: { publicado: true },
                        },
                    },
                },
            },
            orderBy: {
                nome: "asc"
            }
        });

        return NextResponse.json({ data: categories }, { status: 200 });
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

        await prisma.postCategoria.create({
            data: {
                nome: validatedBody.data,
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
