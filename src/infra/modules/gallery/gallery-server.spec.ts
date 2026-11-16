import { OriginTypes, Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/src/lib/errors/AppError";
import { storage } from "@/src/lib/storage";
import { logger } from "@/src/ui/lib/logger";
import { fileTypeFromBuffer } from "file-type";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createGalleryItemRecord,
    deleteGalleryItemById,
    listGalleryItems,
    updateGalleryItemById,
} from "./gallery-server.service";
import { createGalleryItemSchema, getGalleryItemsSchema, updateGalleryActiveSchema } from "./gallery.schema";

type GalleryItemModel = {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    origin: OriginTypes;
    createdAt: Date;
    updatedAt: Date;
};

type PostWithPhoto = {
    id: string;
    title: string;
    photo: {
        id: string;
        url: string;
    } | null;
};

type TransactionCallback<T> = (tx: {
    galleryItem: {
        count: typeof prisma.galleryItem.count;
        create: typeof prisma.galleryItem.create;
        update: typeof prisma.galleryItem.update;
    };
}) => Promise<T>;

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        galleryItem: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        post: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock("@/src/lib/storage", () => ({
    storage: {
        getPrivateUrl: vi.fn(),
        uploadPublic: vi.fn(),
        uploadPrivate: vi.fn(),
        changeVisibility: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("file-type", () => ({
    fileTypeFromBuffer: vi.fn(),
}));

vi.mock("@/src/ui/lib/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

function makeGalleryItem(overrides: Partial<GalleryItemModel> = {}): GalleryItemModel {
    return {
        id: "item-1",
        title: "Item 1",
        url: "https://storage.example.com/item1.jpg",
        isActive: true,
        origin: OriginTypes.UPLOAD,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        ...overrides,
    };
}

describe("Gallery Server Module", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(prisma.$transaction).mockImplementation(async (arg: unknown) => {
            if (typeof arg === "function") {
                const fn = arg as TransactionCallback<unknown>;
                return fn({
                    galleryItem: {
                        count: prisma.galleryItem.count,
                        create: prisma.galleryItem.create,
                        update: prisma.galleryItem.update,
                    },
                });
            }
            if (Array.isArray(arg)) {
                return Promise.all(arg);
            }
            return null;
        });
    });

    describe("gallery.schema", () => {
        describe("getGalleryItemsSchema", () => {
            it("aplica valores padrão quando parâmetros não são fornecidos", () => {
                const result = getGalleryItemsSchema.parse({});
                expect(result.page).toBe(1);
                expect(result.limit).toBe(9);
                expect(result.isActive).toBeUndefined();
            });

            it("converte strings numéricas e booleanas corretamente", () => {
                const result = getGalleryItemsSchema.parse({
                    page: "3",
                    limit: "12",
                    quantity: "6",
                    isActive: "false",
                    origin: "UPLOAD",
                    wordFilter: "  laboratório  ",
                });
                expect(result.page).toBe(3);
                expect(result.limit).toBe(12);
                expect(result.quantity).toBe(6);
                expect(result.isActive).toBe(false);
                expect(result.origin).toBe("UPLOAD");
                expect(result.wordFilter).toBe("laboratório");
            });

            it("falha com valores inválidos de página ou origem", () => {
                expect(() => getGalleryItemsSchema.parse({ page: -1 })).toThrow();
                expect(() => getGalleryItemsSchema.parse({ origin: "OUTRO" })).toThrow();
            });
        });

        describe("createGalleryItemSchema", () => {
            it("valida criação com UPLOAD e arquivo válido", () => {
                const file = new File([Buffer.from("fake-image")], "photo.png", { type: "image/png" });
                const result = createGalleryItemSchema.parse({
                    title: "Nova foto",
                    isActive: "true",
                    origin: "UPLOAD",
                    file,
                });
                expect(result.title).toBe("Nova foto");
                expect(result.isActive).toBe(true);
                expect(result.origin).toBe("UPLOAD");
                expect(result.file).toBe(file);
            });

            it("valida criação com POST e postId válido", () => {
                const result = createGalleryItemSchema.parse({
                    title: "Foto do post",
                    isActive: false,
                    origin: "POST",
                    postId: "post-123",
                });
                expect(result.title).toBe("Foto do post");
                expect(result.isActive).toBe(false);
                expect(result.origin).toBe("POST");
                expect(result.postId).toBe("post-123");
            });

            it("falha quando origin é UPLOAD mas arquivo está ausente", () => {
                expect(() =>
                    createGalleryItemSchema.parse({
                        title: "Foto sem arquivo",
                        isActive: true,
                        origin: "UPLOAD",
                    })
                ).toThrow();
            });

            it("falha quando origin é POST mas postId está ausente", () => {
                expect(() =>
                    createGalleryItemSchema.parse({
                        title: "Foto sem post",
                        isActive: true,
                        origin: "POST",
                    })
                ).toThrow();
            });
        });

        describe("updateGalleryActiveSchema", () => {
            it("valida dados corretos de atualização", () => {
                const result = updateGalleryActiveSchema.parse({
                    isActive: "true",
                    title: "Título Atualizado",
                });
                expect(result.isActive).toBe(true);
                expect(result.title).toBe("Título Atualizado");
            });

            it("falha quando título está vazio", () => {
                expect(() =>
                    updateGalleryActiveSchema.parse({
                        isActive: true,
                        title: "",
                    })
                ).toThrow();
            });
        });
    });

    describe("gallery-server.service", () => {
        describe("listGalleryItems", () => {
            it("lança ForbiddenError se usuário não for admin e solicitar itens inativos", async () => {
                await expect(
                    listGalleryItems(
                        {
                            isActive: false,
                            page: 1,
                            limit: 9,
                        },
                        false
                    )
                ).rejects.toThrow(ForbiddenError);
            });

            it("permite admin consultar itens inativos", async () => {
                const item = makeGalleryItem({ isActive: false, origin: OriginTypes.POST });
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(1);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([item]);

                const result = await listGalleryItems(
                    {
                        isActive: false,
                        page: 1,
                        limit: 9,
                    },
                    true
                );

                expect(result.data).toHaveLength(1);
                expect(result.meta.total).toBe(1);
            });

            it("força isActive = true para não admin quando isActive não for informado", async () => {
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(0);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([]);

                await listGalleryItems(
                    {
                        page: 1,
                        limit: 9,
                    },
                    false
                );

                expect(prisma.galleryItem.count).toHaveBeenCalledWith({
                    where: { isActive: true },
                });
            });

            it("aplica filtros de palavra e origem corretamente", async () => {
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(0);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([]);

                await listGalleryItems(
                    {
                        page: 2,
                        limit: 5,
                        wordFilter: "robótica",
                        origin: "UPLOAD",
                    },
                    true
                );

                expect(prisma.galleryItem.findMany).toHaveBeenCalledWith({
                    where: {
                        origin: "UPLOAD",
                        title: { contains: "robótica", mode: "insensitive" },
                    },
                    take: 5,
                    skip: 5,
                    orderBy: { createdAt: "desc" },
                });
            });

            it("usa quantity quando informado para take e skip", async () => {
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(10);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([]);

                const result = await listGalleryItems(
                    {
                        page: 2,
                        limit: 9,
                        quantity: 4,
                    },
                    true
                );

                expect(prisma.galleryItem.findMany).toHaveBeenCalledWith({
                    where: {},
                    take: 4,
                    skip: 0,
                    orderBy: { createdAt: "desc" },
                });
                expect(result.meta.totalPages).toBe(1);
                expect(result.meta.limit).toBe(4);
            });

            it("gera URL privada para itens inativos do tipo UPLOAD quando admin", async () => {
                const item = makeGalleryItem({
                    isActive: false,
                    origin: OriginTypes.UPLOAD,
                    url: "gallery/privada.jpg",
                });
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(1);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([item]);
                vi.mocked(storage.getPrivateUrl).mockResolvedValue("https://signed-url.com/privada.jpg");

                const result = await listGalleryItems({ page: 1, limit: 9 }, true);

                expect(storage.getPrivateUrl).toHaveBeenCalledWith("gallery/privada.jpg");
                expect(result.data[0].url).toBe("https://signed-url.com/privada.jpg");
            });

            it("continua normalmente e registra log.warn se geração de URL privada falhar", async () => {
                const item = makeGalleryItem({
                    isActive: false,
                    origin: OriginTypes.UPLOAD,
                    url: "gallery/privada.jpg",
                });
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(1);
                vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([item]);
                vi.mocked(storage.getPrivateUrl).mockRejectedValue(new Error("Storage unavailable"));

                const result = await listGalleryItems({ page: 1, limit: 9 }, true);

                expect(logger.warn).toHaveBeenCalled();
                expect(result.data[0].url).toBe("gallery/privada.jpg");
            });
        });

        describe("createGalleryItemRecord", () => {
            describe("origem POST", () => {
                it("lança NotFoundError se o post não existir", async () => {
                    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

                    await expect(
                        createGalleryItemRecord({
                            title: "Foto do post",
                            isActive: true,
                            origin: "POST",
                            postId: "post-404",
                        })
                    ).rejects.toThrow(NotFoundError);
                });

                it("lança NotFoundError se o post não possuir foto associada", async () => {
                    const postWithoutPhoto: PostWithPhoto = {
                        id: "post-1",
                        title: "Post sem foto",
                        photo: null,
                    };
                    vi.mocked(prisma.post.findUnique).mockResolvedValue(
                        postWithoutPhoto as unknown as Awaited<ReturnType<typeof prisma.post.findUnique>>
                    );

                    await expect(
                        createGalleryItemRecord({
                            title: "Foto do post",
                            isActive: true,
                            origin: "POST",
                            postId: "post-1",
                        })
                    ).rejects.toThrow(NotFoundError);
                });

                it("cria item com a URL da foto do post", async () => {
                    const postWithPhoto: PostWithPhoto = {
                        id: "post-1",
                        title: "Post com foto",
                        photo: { id: "photo-1", url: "https://example.com/post-photo.jpg" },
                    };
                    vi.mocked(prisma.post.findUnique).mockResolvedValue(
                        postWithPhoto as unknown as Awaited<ReturnType<typeof prisma.post.findUnique>>
                    );

                    const created = makeGalleryItem({
                        title: "Foto do post",
                        origin: OriginTypes.POST,
                        url: "https://example.com/post-photo.jpg",
                        isActive: false,
                    });
                    vi.mocked(prisma.galleryItem.create).mockResolvedValue(created);

                    const result = await createGalleryItemRecord({
                        title: "Foto do post",
                        isActive: false,
                        origin: "POST",
                        postId: "post-1",
                    });

                    expect(result).toEqual(created);
                    expect(prisma.galleryItem.create).toHaveBeenCalledWith({
                        data: {
                            title: "Foto do post",
                            isActive: false,
                            origin: OriginTypes.POST,
                            url: "https://example.com/post-photo.jpg",
                        },
                    });
                });
            });

            describe("origem UPLOAD", () => {
                const sampleFile = new File([Buffer.from("sample")], "test.jpg", { type: "image/jpeg" });

                it("lança AppError 415 se tipo de arquivo não for detectado", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);

                    await expect(
                        createGalleryItemRecord({
                            title: "Upload teste",
                            isActive: true,
                            origin: "UPLOAD",
                            file: sampleFile,
                        })
                    ).rejects.toThrow(AppError);
                });

                it("lança AppError 415 se mime type não for suportado", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue({
                        ext: "pdf",
                        mime: "application/pdf",
                    });

                    await expect(
                        createGalleryItemRecord({
                            title: "Arquivo pdf",
                            isActive: true,
                            origin: "UPLOAD",
                            file: sampleFile,
                        })
                    ).rejects.toThrow(AppError);
                });

                it("faz upload público quando isActive for true", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue({
                        ext: "jpg",
                        mime: "image/jpeg",
                    });
                    vi.mocked(storage.uploadPublic).mockResolvedValue({
                        url: "https://storage.com/public.jpg",
                        path: "gallery/public.jpg",
                    });

                    const created = makeGalleryItem({
                        title: "Upload Ativo",
                        isActive: true,
                        url: "https://storage.com/public.jpg",
                    });
                    vi.mocked(prisma.galleryItem.count).mockResolvedValue(2);
                    vi.mocked(prisma.galleryItem.create).mockResolvedValue(created);

                    const result = await createGalleryItemRecord({
                        title: "Upload Ativo",
                        isActive: true,
                        origin: "UPLOAD",
                        file: sampleFile,
                    });

                    expect(storage.uploadPublic).toHaveBeenCalled();
                    expect(result).toEqual(created);
                });

                it("faz upload privado quando isActive for false", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue({
                        ext: "png",
                        mime: "image/png",
                    });
                    vi.mocked(storage.uploadPrivate).mockResolvedValue({
                        path: "gallery/private.png",
                    });

                    const created = makeGalleryItem({
                        title: "Upload Inativo",
                        isActive: false,
                        url: "gallery/private.png",
                    });
                    vi.mocked(prisma.galleryItem.create).mockResolvedValue(created);

                    const result = await createGalleryItemRecord({
                        title: "Upload Inativo",
                        isActive: false,
                        origin: "UPLOAD",
                        file: sampleFile,
                    });

                    expect(storage.uploadPrivate).toHaveBeenCalled();
                    expect(result).toEqual(created);
                });

                it("lança ConflictError e apaga arquivo do storage se limite de 6 itens ativos for atingido", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue({
                        ext: "jpg",
                        mime: "image/jpeg",
                    });
                    vi.mocked(storage.uploadPublic).mockResolvedValue({
                        url: "https://storage.com/limit.jpg",
                        path: "gallery/limit.jpg",
                    });
                    vi.mocked(prisma.galleryItem.count).mockResolvedValue(6);

                    await expect(
                        createGalleryItemRecord({
                            title: "Tentativa de exceder",
                            isActive: true,
                            origin: "UPLOAD",
                            file: sampleFile,
                        })
                    ).rejects.toThrow(ConflictError);

                    expect(storage.delete).toHaveBeenCalledWith("gallery/limit.jpg");
                });

                it("lança ConflictError e apaga arquivo se ocorrer P2002 (título duplicado)", async () => {
                    vi.mocked(fileTypeFromBuffer).mockResolvedValue({
                        ext: "jpg",
                        mime: "image/jpeg",
                    });
                    vi.mocked(storage.uploadPublic).mockResolvedValue({
                        url: "https://storage.com/dup.jpg",
                        path: "gallery/dup.jpg",
                    });
                    vi.mocked(prisma.galleryItem.count).mockResolvedValue(2);
                    vi.mocked(prisma.galleryItem.create).mockRejectedValue(
                        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
                            code: "P2002",
                            clientVersion: "test",
                        })
                    );

                    await expect(
                        createGalleryItemRecord({
                            title: "Título duplicado",
                            isActive: true,
                            origin: "UPLOAD",
                            file: sampleFile,
                        })
                    ).rejects.toThrow(ConflictError);

                    expect(storage.delete).toHaveBeenCalledWith("gallery/dup.jpg");
                });
            });
        });

        describe("updateGalleryItemById", () => {
            it("lança NotFoundError se o item não existir", async () => {
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(null);

                await expect(
                    updateGalleryItemById("item-404", {
                        title: "Novo",
                        isActive: true,
                    })
                ).rejects.toThrow(NotFoundError);
            });

            it("lança ConflictError se isActive for true e activeCount >= 6", async () => {
                const existing = makeGalleryItem({ id: "item-1", isActive: false });
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(existing);
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(6);

                await expect(
                    updateGalleryItemById("item-1", {
                        title: "Ativar item",
                        isActive: true,
                    })
                ).rejects.toThrow(ConflictError);
            });

            it("altera visibilidade no storage quando UPLOAD muda de isActive", async () => {
                const existing = makeGalleryItem({
                    id: "item-1",
                    origin: OriginTypes.UPLOAD,
                    isActive: false,
                    url: "gallery/privado.jpg",
                });
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(existing);
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(3);
                vi.mocked(storage.changeVisibility).mockResolvedValue({
                    url: "https://storage.com/publico.jpg",
                    path: "gallery/publico.jpg",
                });

                const updated = makeGalleryItem({
                    id: "item-1",
                    isActive: true,
                    url: "https://storage.com/publico.jpg",
                    title: "Foto ativada",
                });
                vi.mocked(prisma.galleryItem.update).mockResolvedValue(updated);

                const result = await updateGalleryItemById("item-1", {
                    title: "Foto ativada",
                    isActive: true,
                });

                expect(storage.changeVisibility).toHaveBeenCalledWith("gallery/privado.jpg", true);
                expect(result).toEqual({ data: updated });
            });

            it("lança ConflictError se o update retornar erro P2002", async () => {
                const existing = makeGalleryItem({ id: "item-1", isActive: false });
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(existing);
                vi.mocked(prisma.galleryItem.count).mockResolvedValue(3);
                vi.mocked(prisma.galleryItem.update).mockRejectedValue(
                    new Prisma.PrismaClientKnownRequestError("Unique", {
                        code: "P2002",
                        clientVersion: "test",
                    })
                );

                await expect(
                    updateGalleryItemById("item-1", {
                        title: "Título em conflito",
                        isActive: true,
                    })
                ).rejects.toThrow(ConflictError);
            });
        });

        describe("deleteGalleryItemById", () => {
            it("lança NotFoundError se o item não for encontrado", async () => {
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(null);

                await expect(deleteGalleryItemById("item-404")).rejects.toThrow(NotFoundError);
            });

            it("deleta o item com sucesso e retorna status 204", async () => {
                const existing = makeGalleryItem({ id: "item-1" });
                vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(existing);
                vi.mocked(prisma.galleryItem.delete).mockResolvedValue(existing);

                const result = await deleteGalleryItemById("item-1");

                expect(prisma.galleryItem.delete).toHaveBeenCalledWith({
                    where: { id: "item-1" },
                });
                expect(result).toEqual({ status: 204 });
            });
        });
    });
});
