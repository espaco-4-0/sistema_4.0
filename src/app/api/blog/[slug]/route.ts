import { prisma } from "@/src/infra/data/prisma";
import { postSlugBlogSchema, updateBlogSchema, ALLOWED_TYPES } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { storage } from "@/src/lib/storage";
import { fileTypeFromBuffer } from "file-type";
import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";
import { logger } from "@/src/ui/lib/logger";

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
                foto: {
                    select: { url: true },
                },
                categoria: {
                    select: { nome: true },
                },
                autor: {
                    select: { nomeCompleto: true },
                },
                _count: {
                    select: { curtidas: true, comentarios: true },
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

        if (!post.publicado && session?.user?.role === "ADMIN" && post.foto) {
            try {
                post.foto.url = await storage.getPrivateUrl(post.foto.url);
            } catch (err) {
                logger.warn({ err, postId: post.id }, "Falha ao gerar URL assinada no slug GET");
            }
        }

        const data = {
            ...post,
            likesCount: post._count?.curtidas || 0,
            commentsCount: post._count?.comentarios || 0,
            isLiked: (post as any).curtidas?.length > 0,
        };

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Erro interno no slug GET blog");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const slug: string = (await params).slug;
        const body = await req.json();
        const { published } = body;

        const existingPost = await prisma.post.findUnique({
            where: { slug },
            include: { foto: true }
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        const updatedPost = await prisma.$transaction(async (tx) => {
            const post = await tx.post.update({
                where: { slug },
                data: { publicado: published },
            });

            if (existingPost.publicado !== published && existingPost.foto) {
                const result = await storage.changeVisibility(existingPost.foto.url, published);
                await tx.foto.update({
                    where: { id: existingPost.foto.id },
                    data: { url: result.url || result.path }
                });
            }

            return post;
        });

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Erro interno no PATCH blog");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const slug: string = (await params).slug;

        await prisma.post.delete({
            where: { slug },
        });

        return NextResponse.json({ message: "Post excluído com sucesso" }, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Erro interno no DELETE blog");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        const currentSlug: string = (await params).slug;
        const formData = await req.formData();
        const dataObject = Object.fromEntries(formData.entries());
        const validatedData = updateBlogSchema.safeParse(dataObject);

        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { title, slug: newSlug, content, published, file, summary, category, authorId } = validatedData.data;

        const existingPost = await prisma.post.findUnique({
            where: { slug: currentSlug },
            include: { foto: true }
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        let fotoUrl = existingPost.foto?.url;
        let storagePath: string | null = null;

        if (file) {
            const fileBytes = await file.arrayBuffer();
            const fileBuffer = Buffer.from(fileBytes);
            const detected = await fileTypeFromBuffer(fileBuffer);

            if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
                return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
            }

            if (published) {
                const { path, url } = await storage.uploadPublic(file, `posts/${newSlug}`, detected.mime);
                fotoUrl = url || path;
                storagePath = path;
            } else {
                const { path } = await storage.uploadPrivate(file, `posts/${newSlug}`, detected.mime);
                fotoUrl = path;
                storagePath = path;
            }
        }

        const updatedPost = await prisma.$transaction(async (tx) => {
            const post = await tx.post.update({
                where: { slug: currentSlug },
                data: {
                    titulo: title,
                    slug: newSlug,
                    conteudo: content,
                    resumo: summary,
                    publicado: published,
                    tempoDeLeitura: estimateReadingTimeInMinutes(content),
                    ...(category && {
                        categoria: {
                            connectOrCreate: {
                                where: { nome: category },
                                create: { nome: category },
                            },
                        },
                    }),
                    ...(authorId && {
                        autor: {
                            connect: { id: authorId },
                        },
                    }),
                },
            });

            if (file) {
                await tx.foto.update({
                    where: { postId: post.id },
                    data: { url: fotoUrl },
                });
            }

            if (!file && existingPost.publicado !== published && existingPost.foto) {
                const result = await storage.changeVisibility(existingPost.foto.url, published);
                await tx.foto.update({
                    where: { id: existingPost.foto.id },
                    data: { url: result.url || result.path }
                });
            }

            return post;
        });

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err: any) {
        logger.error({ err }, "Erro interno no PUT blog");
        if (err.code === "P2002") {
            return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
        }
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
