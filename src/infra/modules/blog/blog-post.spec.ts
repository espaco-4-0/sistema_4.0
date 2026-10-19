import { Prisma } from "@/src/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
        post: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        postPhoto: {
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/src/lib/storage", () => ({
    storage: {
        getPrivateUrl: vi.fn().mockResolvedValue("https://private.signed.url"),
        changeVisibility: vi.fn().mockResolvedValue({ url: "https://public.url", path: "path" }),
        delete: vi.fn().mockResolvedValue(undefined),
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { listPosts, createPost, findPostBySlug, deletePostBySlug } = await import("./blog-post.service");

beforeEach(() => {
    vi.clearAllMocks();
});

describe("blog-post.service", () => {
    describe("listPosts", () => {
        it("retorna posts paginados e mapeados", async () => {
            const mockDate = new Date();
            const mockPost = {
                id: "p-1",
                title: "Post de Teste",
                slug: "post-de-teste",
                summary: "Resumo",
                content: "Conteúdo longo...",
                readingTime: 3,
                isPublished: true,
                createdAt: mockDate,
                updatedAt: mockDate,
                authorId: "auth-1",
                photo: { url: "https://img.com/foto.jpg" },
                category: { name: "Notícias" },
                author: { fullName: "Professor Xavier" },
            };

            vi.mocked(prisma.$transaction).mockResolvedValue([1, [mockPost]] as never);

            const result = await listPosts({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toMatchObject({
                id: "p-1",
                titulo: "Post de Teste",
                slug: "post-de-teste",
                foto: { url: "https://img.com/foto.jpg" },
                categoria: { nome: "Notícias" },
                autor: { nomeCompleto: "Professor Xavier" },
            });
            expect(result.meta.total).toBe(1);
        });
    });

    describe("createPost", () => {
        it("cria post em transação com sucesso", async () => {
            const created = { id: "p-new", slug: "novo-post" };
            vi.mocked(prisma.$transaction).mockImplementation((async (
                cb: (tx: { post: { create: unknown }; postPhoto: { create: unknown } }) => unknown
            ) => {
                return cb({
                    post: { create: vi.fn().mockResolvedValue(created) },
                    postPhoto: { create: vi.fn().mockResolvedValue({ id: "photo-1" }) },
                });
            }) as never);

            const res = await createPost({
                title: "Novo Post",
                slug: "novo-post",
                content: "Conteudo",
                published: true,
                category: "Geral",
                authorId: "user-1",
                photoUrl: "https://photo.url",
            });

            expect(res).toEqual(created);
        });

        it("lança ConflictError se slug já existir (P2002)", async () => {
            const p2002 = new Prisma.PrismaClientKnownRequestError("Slug unique fail", {
                code: "P2002",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.$transaction).mockRejectedValue(p2002);

            await expect(
                createPost({
                    title: "Novo",
                    slug: "novo",
                    content: "C",
                    published: true,
                    category: "G",
                    authorId: "u1",
                    photoUrl: "url",
                })
            ).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("Slug já existe"),
            });
        });
    });

    describe("findPostBySlug", () => {
        it("lança NotFoundError se post não for encontrado", async () => {
            vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

            await expect(findPostBySlug("inexistente")).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
            });
        });

        it("lança NotFoundError se post não publicado e usuário não for admin", async () => {
            vi.mocked(prisma.post.findUnique).mockResolvedValue({
                id: "p-1",
                isPublished: false,
            } as never);

            await expect(findPostBySlug("rascunho", "user-1", false)).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
            });
        });

        it("retorna post detalhado com status de curtida", async () => {
            const mockDate = new Date();
            vi.mocked(prisma.post.findUnique).mockResolvedValue({
                id: "p-1",
                title: "Publicado",
                slug: "publicado",
                summary: "Resumo",
                content: "Conteúdo",
                readingTime: 2,
                isPublished: true,
                createdAt: mockDate,
                updatedAt: mockDate,
                authorId: "u-1",
                photo: { url: "http://photo.url" },
                category: { name: "Geral" },
                author: { fullName: "Autor" },
                _count: { Like: 3, Comment: 2 },
                Like: [{ id: "l-1" }],
            } as never);

            const res = await findPostBySlug("publicado", "u-1", false);

            expect(res.isLiked).toBe(true);
            expect(res.likesCount).toBe(3);
            expect(res.commentsCount).toBe(2);
        });
    });

    describe("deletePostBySlug", () => {
        it("deleta post por slug", async () => {
            vi.mocked(prisma.post.delete).mockResolvedValue({ id: "p-1" } as never);

            await expect(deletePostBySlug("slug-teste")).resolves.not.toThrow();
            expect(prisma.post.delete).toHaveBeenCalledWith({ where: { slug: "slug-teste" } });
        });

        it("lança NotFoundError se post não existir (P2025)", async () => {
            const p2025 = new Prisma.PrismaClientKnownRequestError("Not found", {
                code: "P2025",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.post.delete).mockRejectedValue(p2025);

            await expect(deletePostBySlug("inexistente")).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
            });
        });
    });
});
