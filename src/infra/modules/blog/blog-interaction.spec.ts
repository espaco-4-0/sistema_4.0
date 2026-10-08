import { Prisma } from "@/src/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        comment: {
            findMany: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
        like: {
            create: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { listPostComments, createComment, deleteComment, createLike, deleteLike } =
    await import("./blog-interaction.service");

beforeEach(() => {
    vi.clearAllMocks();
});

describe("blog-interaction.service", () => {
    describe("listPostComments", () => {
        it("retorna comentários paginados com autor", async () => {
            const mockDate = new Date();
            vi.mocked(prisma.comment.findMany).mockResolvedValue([
                {
                    id: "c-1",
                    content: "Ótimo post!",
                    createdAt: mockDate,
                    author: { id: "u-1", fullName: "Aluno Teste" },
                } as any,
            ]);
            vi.mocked(prisma.comment.count).mockResolvedValue(1);

            const result = await listPostComments("meu-post", 1, 6);

            expect(result.data).toEqual([
                {
                    id: "c-1",
                    conteudo: "Ótimo post!",
                    createdAt: mockDate,
                    autor: { id: "u-1", nomeCompleto: "Aluno Teste" },
                },
            ]);
            expect(result.meta).toEqual({
                total: 1,
                page: 1,
                limit: 6,
                totalPages: 1,
            });
        });
    });

    describe("createComment", () => {
        it("cria comentário com sucesso", async () => {
            vi.mocked(prisma.comment.create).mockResolvedValue({ id: "c-1" } as any);

            const res = await createComment("u-1", "p-1", "Meu comentário");
            expect(res).toEqual({ id: "c-1" });
        });

        it("lança ConflictError se usuário ou post não existir (P2003)", async () => {
            const p2003 = new Prisma.PrismaClientKnownRequestError("Foreign key fail", {
                code: "P2003",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.comment.create).mockRejectedValue(p2003);

            await expect(createComment("u-x", "p-x", "Texto")).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("não encontrado"),
            });
        });
    });

    describe("deleteComment", () => {
        it("lança NotFoundError se comentário não existir", async () => {
            vi.mocked(prisma.comment.findUnique).mockResolvedValue(null);

            await expect(deleteComment("c-inexistente", "u-1", false)).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
            });
        });

        it("lança ForbiddenError se o usuário não for autor nem admin", async () => {
            vi.mocked(prisma.comment.findUnique).mockResolvedValue({
                id: "c-1",
                authorId: "outro-autor",
            } as any);

            await expect(deleteComment("c-1", "u-1", false)).rejects.toMatchObject({
                statusCode: 403,
                code: "FORBIDDEN",
            });
        });

        it("permite exclusão se for o autor", async () => {
            vi.mocked(prisma.comment.findUnique).mockResolvedValue({
                id: "c-1",
                authorId: "u-1",
            } as any);
            vi.mocked(prisma.comment.delete).mockResolvedValue({ id: "c-1" } as any);

            await expect(deleteComment("c-1", "u-1", false)).resolves.not.toThrow();
            expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: "c-1" } });
        });

        it("permite exclusão se for ADMIN mesmo não sendo o autor", async () => {
            vi.mocked(prisma.comment.findUnique).mockResolvedValue({
                id: "c-1",
                authorId: "outro-autor",
            } as any);
            vi.mocked(prisma.comment.delete).mockResolvedValue({ id: "c-1" } as any);

            await expect(deleteComment("c-1", "admin-id", true)).resolves.not.toThrow();
            expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: "c-1" } });
        });
    });

    describe("createLike", () => {
        it("cria like com sucesso", async () => {
            vi.mocked(prisma.like.create).mockResolvedValue({ id: "l-1" } as any);

            await expect(createLike("u-1", "p-1")).resolves.not.toThrow();
        });

        it("lança ConflictError se post já foi curtido (P2002)", async () => {
            const p2002 = new Prisma.PrismaClientKnownRequestError("Unique fail", {
                code: "P2002",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.like.create).mockRejectedValue(p2002);

            await expect(createLike("u-1", "p-1")).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("já foi curtido"),
            });
        });
    });

    describe("deleteLike", () => {
        it("deleta like com sucesso", async () => {
            vi.mocked(prisma.like.delete).mockResolvedValue({ id: "l-1" } as any);

            await expect(deleteLike("u-1", "p-1")).resolves.not.toThrow();
        });

        it("lança ConflictError se curtida não existia (P2025)", async () => {
            const p2025 = new Prisma.PrismaClientKnownRequestError("Not found", {
                code: "P2025",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.like.delete).mockRejectedValue(p2025);

            await expect(deleteLike("u-1", "p-1")).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("não existe"),
            });
        });
    });
});
