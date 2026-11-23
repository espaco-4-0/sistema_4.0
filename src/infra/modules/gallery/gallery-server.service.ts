import { OriginTypes, Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ALLOWED_TYPES } from "@/src/infra/modules/blog/blog.schema";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/src/lib/errors/AppError";
import { storage } from "@/src/lib/storage";
import { logger } from "@/src/ui/lib/logger";
import { fileTypeFromBuffer } from "file-type";

import { CreateGalleryItemInput, GetGalleryItemsInput, UpdateGalleryActiveInput } from "./gallery.schema";

export async function listGalleryItems(params: GetGalleryItemsInput, isAdmin: boolean) {
    const where: Prisma.GalleryItemWhereInput = {};

    if (params.isActive !== undefined) {
        if (params.isActive === false && !isAdmin) {
            throw new ForbiddenError("Não autorizado");
        }
        where.isActive = params.isActive;
    } else {
        if (!isAdmin) {
            where.isActive = true;
        }
    }

    if (params.origin) {
        where.origin = params.origin as OriginTypes;
    }

    if (params.wordFilter) {
        where.title = {
            contains: params.wordFilter,
            mode: "insensitive",
        };
    }

    const take = params.quantity ?? params.limit;
    const skip = params.quantity ? 0 : (params.page - 1) * params.limit;

    const [total, items] = await prisma.$transaction([
        prisma.galleryItem.count({ where }),
        prisma.galleryItem.findMany({
            where,
            take,
            skip,
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    if (isAdmin) {
        for (const item of items) {
            if (!item.isActive && item.origin === "UPLOAD") {
                try {
                    item.url = await storage.getPrivateUrl(item.url);
                } catch (err: unknown) {
                    logger.warn({ err, itemId: item.id }, "Falha ao gerar URL assinada");
                }
            }
        }
    }

    return {
        data: items,
        meta: {
            total,
            page: params.page,
            limit: params.quantity ?? params.limit,
            totalPages: params.quantity ? 1 : Math.ceil(total / take),
        },
    };
}

export async function createGalleryItemRecord(input: CreateGalleryItemInput) {
    let finalUrl = "";
    let storagePath: string | null = null;

    if (input.origin === "POST") {
        const post = await prisma.post.findUnique({
            where: { id: input.postId },
            include: { photo: true },
        });

        if (!post || !post.photo) {
            throw new NotFoundError("Post ou foto", input.postId);
        }

        finalUrl = post.photo.url;
    } else if (input.origin === "UPLOAD") {
        const file = input.file as File;
        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        const detected = await fileTypeFromBuffer(fileBuffer);

        if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
            throw new AppError("Tipo de arquivo não permitido", 415, "UNSUPPORTED_MEDIA_TYPE");
        }

        const fileName = `${Date.now()}-${input.title.toLowerCase().trim().replace(/\s+/g, "-")}`;

        if (input.isActive) {
            const upload = await storage.uploadPublic(file, `gallery/${fileName}`, detected.mime);
            finalUrl = upload.url!;
            storagePath = upload.path;
        } else {
            const upload = await storage.uploadPrivate(file, `gallery/${fileName}`, detected.mime);
            finalUrl = upload.path;
            storagePath = upload.path;
        }
    }

    try {
        const newItem = await prisma.$transaction(async (tx) => {
            if (input.isActive) {
                const activeCount = await tx.galleryItem.count({
                    where: { isActive: true },
                });

                if (activeCount >= 6) {
                    throw new ConflictError("Limite de 6 imagens excedido");
                }
            }

            return await tx.galleryItem.create({
                data: {
                    title: input.title,
                    isActive: input.isActive,
                    origin: input.origin as OriginTypes,
                    url: finalUrl,
                },
            });
        });

        return newItem;
    } catch (err: unknown) {
        if (storagePath) {
            await storage.delete(storagePath);
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Já existe um item com este título");
        }

        if (err instanceof AppError) {
            throw err;
        }

        throw err;
    }
}

export async function updateGalleryItemById(id: string, input: UpdateGalleryActiveInput) {
    const existingItem = await prisma.galleryItem.findUnique({
        where: { id },
    });

    if (!existingItem) {
        throw new NotFoundError("Item da galeria", id);
    }

    if (input.isActive) {
        const activeCount = await prisma.galleryItem.count({
            where: { isActive: true },
        });

        if (activeCount >= 6) {
            throw new ConflictError("Limite de 6 imagens excedido");
        }
    }

    try {
        const updatedItem = await prisma.$transaction(async (tx) => {
            let finalUrl = existingItem.url;

            if (existingItem.origin === "UPLOAD" && input.isActive !== existingItem.isActive) {
                const result = await storage.changeVisibility(existingItem.url, input.isActive);
                finalUrl = result.url || result.path;
            }

            return await tx.galleryItem.update({
                where: { id },
                data: {
                    isActive: input.isActive,
                    title: input.title,
                    url: finalUrl,
                },
            });
        });

        return { data: updatedItem };
    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Já existe uma imagem com este título");
        }
        throw err;
    }
}

export async function deleteGalleryItemById(id: string) {
    const existingItem = await prisma.galleryItem.findUnique({
        where: { id },
    });

    if (!existingItem) {
        throw new NotFoundError("Item da galeria", id);
    }

    await prisma.galleryItem.delete({
        where: { id },
    });

    return { status: 204 };
}
