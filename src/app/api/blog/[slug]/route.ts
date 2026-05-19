import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ALLOWED_TYPES, postSlugBlogSchema, updateBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";
import { storage } from "@/src/lib/storage";
import { logger } from "@/src/ui/lib/logger";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Não autorizado" }, { status: 403 }),
        };
    }
    return { authorized: true as const, session };
}

function handleError(err: unknown, context: string): NextResponse {
    logger.error({ err }, context);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const session = await getServerSession(authOptions);

        const post = await prisma.post.findUnique({
            where: {
                slug: validatedSlug.data,
                isPublished: true,
            },
            include: {
                photo: { select: { url: true } },
                category: { select: { name: true } },
                author: { select: { fullName: true } },
                _count: { select: { Like: true, Comment: true } },
                Like: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        if (!post.isPublished && session?.user?.role === "ADMIN" && post.photo) {
            try {
                post.photo.url = await storage.getPrivateUrl(post.photo.url);
            } catch (err) {
                logger.warn({ err, postId: post.id }, "Falha ao gerar URL assinada no slug GET");
            }
        }

        const data = {
            id: post.id,
            titulo: post.title,
            slug: post.slug,
            resumo: post.summary,
            conteudo: post.content,
            tempoDeLeitura: post.readingTime,
            publicado: post.isPublished,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            autorId: post.authorId,
            foto: { url: post.photo?.url || "" },
            categoria: { nome: post.category?.name || "Geral" },
            autor: { nomeCompleto: post.author?.fullName || "Autor desconhecido" },
            likesCount: post._count?.Like || 0,
            commentsCount: post._count?.Comment || 0,
            isLiked: (post as any).Like?.length > 0,
        };

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        return handleError(err, "Erro interno no slug GET blog");
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.authorized) return guard.response;

        const slug: string = (await params).slug;
        const { published } = await req.json();

        const existingPost = await prisma.post.findUnique({ where: { slug }, include: { photo: true } });
        if (!existingPost) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        const updatedPost = await prisma.$transaction(async (tx) => {
            const post = await tx.post.update({ where: { slug }, data: { isPublished: published } });

            if (existingPost.isPublished !== published && existingPost.photo) {
                const result = await storage.changeVisibility(existingPost.photo.url, published);
                await tx.postPhoto.update({ where: { id: existingPost.photo.id }, data: { url: result.url || result.path } });
            }

            return post;
        });

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err) {
        return handleError(err, "Erro interno no PATCH blog");
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.authorized) return guard.response;

        const slug: string = (await params).slug;
        await prisma.post.delete({ where: { slug } });

        return NextResponse.json({ message: "Post excluído com sucesso" }, { status: 200 });
    } catch (err) {
        return handleError(err, "Erro interno no DELETE blog");
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const guard = await requireAdmin();
        if (!guard.authorized) return guard.response;

        const currentSlug: string = (await params).slug;
        const formData = await req.formData();
        const validatedData = updateBlogSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { title, slug: newSlug, content, published, file, summary, category, authorId } = validatedData.data;

        const existingPost = await prisma.post.findUnique({ where: { slug: currentSlug }, include: { photo: true } });
        if (!existingPost) {
            return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        }

        let fotoUrl = existingPost.photo?.url;
        let storagePath: string | null = null;

        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
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
                    title,
                    slug: newSlug,
                    content,
                    summary,
                    isPublished: published,
                    readingTime: estimateReadingTimeInMinutes(content),
                    ...(category && {
                        category: { connectOrCreate: { where: { name: category }, create: { name: category } } },
                    }),
                    ...(authorId && { author: { connect: { id: authorId } } }),
                },
            });

            if (file) {
                await tx.postPhoto.update({ where: { postId: post.id }, data: { url: fotoUrl } });
            }

            if (!file && existingPost.isPublished !== published && existingPost.photo) {
                const result = await storage.changeVisibility(existingPost.photo.url, published);
                await tx.postPhoto.update({ where: { id: existingPost.photo.id }, data: { url: result.url || result.path } });
            }

            return post;
        });

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err) {
        return handleError(err, "Erro interno no PUT blog");
    }
}
