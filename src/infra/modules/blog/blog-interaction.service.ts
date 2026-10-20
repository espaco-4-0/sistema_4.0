import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "@/src/lib/errors/AppError";

export type CommentItem = {
    id: string;
    conteudo: string;
    createdAt: Date;
    autor: {
        id: string;
        nomeCompleto: string;
    };
};

export type PaginatedComments = {
    data: CommentItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export async function listPostComments(slug: string, page = 1, limit = 6): Promise<PaginatedComments> {
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * limit;

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: {
                post: { slug },
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.comment.count({
            where: {
                post: { slug },
            },
        }),
    ]);

    const mappedComments: CommentItem[] = comments.map((comment) => ({
        id: comment.id,
        conteudo: comment.content,
        createdAt: comment.createdAt,
        autor: {
            id: comment.author.id,
            nomeCompleto: comment.author.fullName,
        },
    }));

    return {
        data: mappedComments,
        meta: {
            total,
            page: validPage,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function createComment(authorId: string, postId: string, content: string) {
    try {
        return await prisma.comment.create({
            data: {
                authorId,
                postId,
                content,
            },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
            throw new ConflictError("Usuário ou Post não encontrado");
        }
        throw err;
    }
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw new NotFoundError("Comentário", commentId);
    }

    const isOwner = comment.authorId === userId;
    if (!isAdmin && !isOwner) {
        throw new ForbiddenError("Sem permissão para excluir este comentário");
    }

    try {
        await prisma.comment.delete({
            where: { id: commentId },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new NotFoundError("Comentário", commentId);
        }
        throw err;
    }
}

export async function createLike(userId: string, postId: string) {
    try {
        return await prisma.like.create({
            data: {
                userId,
                postId,
            },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2003") {
                throw new ConflictError("Usuário ou Post não encontrado");
            }
            if (err.code === "P2002") {
                throw new ConflictError("Post já foi curtido");
            }
        }
        throw err;
    }
}

export async function deleteLike(userId: string, postId: string) {
    try {
        await prisma.like.delete({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2003") {
                throw new ConflictError("Usuário ou Post não encontrado");
            }
            if (err.code === "P2025") {
                throw new ConflictError("Não é possível excluir uma curtida que não existe");
            }
        }
        throw err;
    }
}
