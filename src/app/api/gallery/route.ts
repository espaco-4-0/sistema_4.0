import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ALLOWED_TYPES } from "@/src/infra/modules/blog/blog.schema";
import { createGalleryItemSchema, getGalleryItemsSchema } from "@/src/infra/modules/gallery/gallery.schema";
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

        const validatedParams = getGalleryItemsSchema.safeParse(paramsOrUndefined);
        if (!validatedParams.success)
            return NextResponse.json(
                { error: "Dados inválidos", data: validatedParams.error, input: paramsOrUndefined },
                { status: 422 }
            );

        const { isActive, wordFilter, page, limit, quantity, origin } = validatedParams.data;

        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN";

        const where: Prisma.GalleryItemWhereInput = {};

        if (isActive !== undefined) {
            if (isActive === false && !isAdmin) {
                return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
            }
            where.isActive = isActive;
        } else {
            if (!isAdmin) {
                where.isActive = true;
            }
        }

        if (origin) {
            where.origin = origin as any;
        }

        if (wordFilter) {
            where.title = {
                contains: wordFilter,
                mode: "insensitive",
            };
        }

        const take = quantity ?? limit;
        const skip = quantity ? 0 : (page - 1) * limit;

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
                    } catch (err) {
                        logger.warn({ err, itemId: item.id }, "Falha ao gerar URL assinada");
                    }
                }
            }
        }

        return NextResponse.json(
            {
                data: items,
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
        logger.error({ err, route: getRequestInfo(req) }, "Erro interno na galeria");
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
        const validatedData = createGalleryItemSchema.safeParse(dataObject);
        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { title, isActive, origin, file, postId } = validatedData.data;

        let finalUrl: string = "";
        let storagePath: string | null = null;

        try {
            if (origin === "POST") {
                const post = await prisma.post.findUnique({
                    where: { id: postId },
                    include: { photo: true },
                });

                if (!post || !post.photo) {
                    return NextResponse.json({ error: "Post ou foto não encontrada" }, { status: 404 });
                }

                finalUrl = post.photo.url;
            } else if (origin === "UPLOAD") {
                const fileBytes = await (file as File).arrayBuffer();
                const fileBuffer = Buffer.from(fileBytes);
                const detected = await fileTypeFromBuffer(fileBuffer);

                if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
                    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
                }

                const fileName = `${Date.now()}-${title.toLowerCase().trim().replace(/\s+/g, "-")}`;

                if (isActive) {
                    const upload = await storage.uploadPublic(file as File, `gallery/${fileName}`, detected.mime);
                    finalUrl = upload.url!;
                    storagePath = upload.path;
                } else {
                    const upload = await storage.uploadPrivate(file as File, `gallery/${fileName}`, detected.mime);
                    finalUrl = upload.path;
                    storagePath = upload.path;
                }
            }

            const newItem = await prisma.$transaction(async (tx) => {
                if (isActive) {
                    const activeCount = await tx.galleryItem.count({
                        where: { isActive: true },
                    });

                    if (activeCount >= 6) {
                        throw new Error("LIMIT_REACHED");
                    }
                }

                return await tx.galleryItem.create({
                    data: {
                        title,
                        isActive,
                        origin: origin as any,
                        url: finalUrl,
                    },
                });
            });

            return NextResponse.json(newItem, { status: 201 });
        } catch (err: any) {
            if (storagePath) await storage.delete(storagePath);

            if (err.message === "LIMIT_REACHED") {
                return NextResponse.json({ error: "Limite de 6 imagens excedido" }, { status: 400 });
            }

            if (err.code === "P2002") {
                return NextResponse.json({ error: "Já existe um item com este título" }, { status: 409 });
            }

            logger.error({ err, route: getRequestInfo(req) }, "Erro ao processar criação na galeria");
            return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
        }
    } catch (err) {
        logger.error({ err, route: getRequestInfo(req) }, "Erro interno na galeria");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
