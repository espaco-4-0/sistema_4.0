import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ConflictError, NotFoundError } from "@/src/lib/errors/AppError";
import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";
import { storage } from "@/src/lib/storage";
import { logger } from "@/src/ui/lib/logger";

export type PostListItem = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    conteudo: string;
    tempoDeLeitura: number;
    publicado: boolean;
    createdAt: Date;
    updatedAt: Date;
    autorId: string;
    foto: { url: string };
    categoria: { nome: string };
    autor: { nomeCompleto: string };
};

export type ListPostsParams = {
    category?: string;
    name?: string;
    includeArchived?: boolean;
    quantity?: number;
    page?: number;
    limit?: number;
    published?: boolean;
};

export type PaginatedPosts = {
    data: PostListItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export async function listPosts(params: ListPostsParams = {}, isAdmin = false): Promise<PaginatedPosts> {
    const { category, name, includeArchived, quantity, page = 1, limit = 10, published } = params;

    const where: Prisma.PostWhereInput = {};
    if (name) {
        where.title = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (category) {
        where.category = {
            name: category,
        };
    }

    if (published !== undefined) {
        where.isPublished = published;
    } else if (includeArchived === false || includeArchived === undefined) {
        where.isPublished = true;
    }

    const take = quantity ?? limit;
    const skip = quantity ? 0 : (page - 1) * limit;

    const [total, posts] = await prisma.$transaction([
        prisma.post.count({ where }),
        prisma.post.findMany({
            take,
            skip,
            orderBy: {
                createdAt: "desc",
            },
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                content: true,
                readingTime: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
                authorId: true,
                photo: { select: { url: true } },
                category: { select: { name: true } },
                author: { select: { fullName: true } },
            },
        }),
    ]);

    if (isAdmin) {
        for (const post of posts) {
            if (!post.isPublished && post.photo && !post.photo.url.startsWith("http")) {
                try {
                    post.photo.url = await storage.getPrivateUrl(post.photo.url);
                } catch (err) {
                    logger.warn({ err, postId: post.id }, "Falha ao gerar URL assinada");
                }
            }
        }
    }

    const mappedPosts: PostListItem[] = posts.map((post) => ({
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
    }));

    return {
        data: mappedPosts,
        meta: {
            total,
            page,
            limit: quantity ?? limit,
            totalPages: quantity ? 1 : Math.ceil(total / take),
        },
    };
}

export type CreatePostInput = {
    title: string;
    slug: string;
    content: string;
    summary?: string | null;
    published: boolean;
    category: string;
    authorId: string;
    photoUrl: string;
};

export async function createPost(input: CreatePostInput) {
    const { title, slug, content, summary, published, category, authorId, photoUrl } = input;

    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
                data: {
                    title,
                    content,
                    slug,
                    author: {
                        connect: { id: authorId },
                    },
                    isPublished: published,
                    summary: summary ?? null,
                    readingTime: estimateReadingTimeInMinutes(content),
                    category: {
                        connectOrCreate: {
                            where: { name: category },
                            create: { name: category },
                        },
                    },
                },
            });

            await tx.postPhoto.create({
                data: {
                    url: photoUrl,
                    postId: post.id,
                },
            });

            return post;
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Slug já existe");
        }
        throw err;
    }
}

export type PostDetail = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    conteudo: string;
    tempoDeLeitura: number;
    publicado: boolean;
    createdAt: Date;
    updatedAt: Date;
    autorId: string;
    foto: { url: string };
    categoria: { nome: string };
    autor: { nomeCompleto: string };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
};

export async function findPostBySlug(slug: string, userId?: string, isAdmin = false): Promise<PostDetail> {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            photo: { select: { url: true } },
            category: { select: { name: true } },
            author: { select: { fullName: true } },
            _count: { select: { Like: true, Comment: true } },
            Like: userId ? { where: { userId }, select: { id: true } } : false,
        },
    });

    if (!post || (!post.isPublished && !isAdmin)) {
        throw new NotFoundError("Post", slug);
    }

    if (!post.isPublished && isAdmin && post.photo && !post.photo.url.startsWith("http")) {
        try {
            post.photo.url = await storage.getPrivateUrl(post.photo.url);
        } catch (err) {
            logger.warn({ err, postId: post.id }, "Falha ao gerar URL assinada no slug GET");
        }
    }

    const isLiked = Array.isArray((post as any).Like) && (post as any).Like.length > 0;

    return {
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
        isLiked,
    };
}

export async function updatePostVisibility(slug: string, published: boolean) {
    const existingPost = await prisma.post.findUnique({
        where: { slug },
        include: { photo: true },
    });

    if (!existingPost) {
        throw new NotFoundError("Post", slug);
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.update({
                where: { slug },
                data: { isPublished: published },
            });

            if (existingPost.isPublished !== published && existingPost.photo) {
                const result = await storage.changeVisibility(existingPost.photo.url, published);
                await tx.postPhoto.update({
                    where: { id: existingPost.photo.id },
                    data: { url: result.url || result.path },
                });
            }

            return post;
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Slug já existe");
        }
        throw err;
    }
}

export async function deletePostBySlug(slug: string) {
    try {
        return await prisma.post.delete({
            where: { slug },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new NotFoundError("Post", slug);
        }
        throw err;
    }
}

export type UpdatePostInput = {
    title: string;
    newSlug: string;
    content: string;
    summary?: string | null;
    published: boolean;
    category?: string;
    authorId?: string;
    photoUrl?: string;
    hasNewPhoto?: boolean;
};

export async function updatePostBySlug(currentSlug: string, input: UpdatePostInput) {
    const existingPost = await prisma.post.findUnique({
        where: { slug: currentSlug },
        include: { photo: true },
    });

    if (!existingPost) {
        throw new NotFoundError("Post", currentSlug);
    }

    const { title, newSlug, content, summary, published, category, authorId, photoUrl, hasNewPhoto } = input;

    try {
        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.update({
                where: { slug: currentSlug },
                data: {
                    title,
                    slug: newSlug,
                    content,
                    summary: summary ?? null,
                    isPublished: published,
                    readingTime: estimateReadingTimeInMinutes(content),
                    ...(category && {
                        category: {
                            connectOrCreate: {
                                where: { name: category },
                                create: { name: category },
                            },
                        },
                    }),
                    ...(authorId && {
                        author: { connect: { id: authorId } },
                    }),
                },
            });

            if (hasNewPhoto && photoUrl) {
                await tx.postPhoto.update({
                    where: { postId: post.id },
                    data: { url: photoUrl },
                });
            } else if (!hasNewPhoto && existingPost.isPublished !== published && existingPost.photo) {
                const result = await storage.changeVisibility(existingPost.photo.url, published);
                await tx.postPhoto.update({
                    where: { id: existingPost.photo.id },
                    data: { url: result.url || result.path },
                });
            }

            return post;
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Slug já existe");
        }
        throw err;
    }
}
