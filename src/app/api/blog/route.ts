import { Prisma } from "@/src/generated/prisma/client";
import { getBlogSchema, postBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";
import { storage } from "@/src/lib/storage";
import { prisma } from "@/src/ui/lib/prisma";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        if (session.user.role === "VISITANTE") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const formData = await req.formData();
        const dataObject = Object.fromEntries(formData.entries());
        const validatedData = postBlogSchema.safeParse(dataObject);
        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { title, slug, content, published, file, summary, category } = validatedData.data;

        if (category) {
            const haveCategory = await prisma.postCategoria.findUnique({ where: { nome: category } });
            if (!haveCategory) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
        }

        let path: string | null = null;
        let url: string | undefined = undefined;
        try {
            const fileBytes = await file.arrayBuffer();
            const fileBuffer = Buffer.from(fileBytes);
            const detected = await fileTypeFromBuffer(fileBuffer);
            if (!detected || !ALLOWED_TYPES.includes(detected.mime))
                return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });

            if (published) {
                if (session.user.role !== "ADMIN") {
                    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
                }

                ({ path, url } = await storage.uploadPublic(file, `posts/${slug}`, detected.mime));
            } else {
                ({ path } = await storage.uploadPrivate(file, `posts/${slug}`, detected.mime));
            }

            await prisma.$transaction(async (tx) => {
                const post = await tx.post.create({
                    data: {
                        titulo: title,
                        conteudo: content,
                        slug,
                        autorId: session.user.id,
                        publicado: published,
                        resumo: summary,
                        tempoDeLeitura: estimateReadingTimeInMinutes(content),
                        categorias: category
                            ? {
                                  connect: { nome: category },
                              }
                            : undefined,
                    },
                });

                const foto = await tx.postFoto.create({
                    data: {
                        url: url ? url : path!,
                        postId: post.id,
                    },
                });

                await tx.post.update({
                    where: { id: post.id },
                    data: {
                        capaImagemId: foto.id,
                    },
                });
            });

            return NextResponse.json({ message: "Post criado", ...(url && { url: url }) }, { status: 201 });
        } catch (err: any) {
            console.error(err);

            if (path) await storage.delete(path);

            if (err.code === "P2002") {
                return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
            }

            return NextResponse.json({ error: "Erro interno" }, { status: 500 });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
