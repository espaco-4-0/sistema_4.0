import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ALLOWED_TYPES, getBlogSchema, postBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";
import { storage } from "@/src/lib/storage";
import { getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const paramsOrUndefined = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [key, value === "" ? undefined : value])
        );

        const validatedData = getBlogSchema.safeParse(paramsOrUndefined);
        if (!validatedData.success)
            return NextResponse.json(
                { error: "Dados inválidos", data: validatedData.error, input: paramsOrUndefined },
                { status: 422 }
            );

        const { category, name, includeArchived, quantity, page, limit, published } = validatedData.data;

        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN";

        if (includeArchived === true) {
            if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
            if (!isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const where: Prisma.PostWhereInput = {};
        if (name)
            where.titulo = {
                contains: name,
                mode: "insensitive",
            };

        if (category)
            where.categoria = {
                nome: category,
            };

        if (published !== undefined) {
            where.publicado = published;
        } else if (includeArchived === false || includeArchived === undefined) {
            where.publicado = true;
        }

        const take = quantity ?? limit;
        const skip = quantity ? 0 : (page - 1) * limit;

        const isLite = validatedData.data.isLite;
        const postSelect = isLite
            ? {
                  id: true,
                  titulo: true,
                  publicado: true,
                  foto: {
                      select: {
                          url: true,
                      },
                  },
              }
            : {
                  id: true,
                  titulo: true,
                  conteudo: true,
                  createdAt: true,

                  foto: {
                      select: {
                          url: true,
                      },
                  },

                  categoria: {
                      select: {
                          nome: true,
                      },
                  },

                  autor: {
                      select: {
                          nomeCompleto: true,
                      },
                  },
              };

        const [total, posts] = await prisma.$transaction([
            prisma.post.count({ where }),

            prisma.post.findMany({
                take,
                skip,
                orderBy: {
                    createdAt: "desc",
                },
                where,
                select: postSelect,
            }),
        ]);

        if (isAdmin) {
            for (const post of posts) {
                if (!post.publicado && post.foto && !post.foto.url.startsWith("http")) {
                    try {
                        post.foto.url = await storage.getPrivateUrl(post.foto.url);
                    } catch (err) {
                        logger.warn({ err, postId: post.id }, "Falha ao gerar URL assinada");
                    }
                }
            }
        }

        return NextResponse.json(
            {
                data: posts,
                meta: {
                    total,
                    page,
                    limit: quantity ?? limit,
                    totalPages: quantity ? 1 : Math.ceil(total / take),
                },
            },
            { status: 200 }
        );
    } catch (err) {
        logger.error({ err, route: getRequestInfo(req) }, "Erro interno no blog");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const formData = await req.formData();
        const dataObject = Object.fromEntries(formData.entries());
        const validatedData = postBlogSchema.safeParse(dataObject);
        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { title, slug, content, published, file, summary, category, authorId } = validatedData.data;

        if (!category) {
            return NextResponse.json({ error: "Categoria é obrigatória" }, { status: 422 });
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
                        autor: {
                            connect: { id: authorId || session.user.id },
                        },
                        publicado: published,
                        resumo: summary,
                        tempoDeLeitura: estimateReadingTimeInMinutes(content),
                        categoria: {
                            connectOrCreate: {
                                where: { nome: category },
                                create: { nome: category },
                            },
                        },
                    },
                });

                const foto = await tx.foto.create({
                    data: {
                        url: url ? url : path!,
                        postId: post.id,
                    },
                });
            });

            return NextResponse.json({ message: "Post criado", ...(url && { url: url }) }, { status: 201 });
        } catch (err: any) {
            logger.error({ err, route: getRequestInfo(req) }, "Erro ao criar post");

            if (path) await storage.delete(path);

            if (err.code === "P2002") {
                return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
            }

            return NextResponse.json({ error: "Erro interno" }, { status: 500 });
        }
    } catch (err) {
        logger.error({ err, route: getRequestInfo(req) }, "Erro interno no POST blog");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
