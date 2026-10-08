import { Prisma } from "@/src/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        postCategory: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { listCategories, createCategory, updateCategory, deleteCategory } = await import("./blog-category.service");

beforeEach(() => {
    vi.clearAllMocks();
});

describe("blog-category.service", () => {
    describe("listCategories", () => {
        it("retorna categorias mapeadas com contagem de posts", async () => {
            vi.mocked(prisma.postCategory.findMany).mockResolvedValue([
                { id: "cat-1", name: "Tecnologia", _count: { Post: 5 } } as any,
            ]);

            const result = await listCategories();

            expect(result).toEqual([{ id: "cat-1", nome: "Tecnologia", _count: { posts: 5 } }]);
            expect(prisma.postCategory.findMany).toHaveBeenCalledWith({
                where: { Post: { some: { isPublished: true } } },
                select: expect.any(Object),
                orderBy: { name: "asc" },
            });
        });

        it("inclui todas quando includeAll=true", async () => {
            vi.mocked(prisma.postCategory.findMany).mockResolvedValue([]);

            await listCategories(true);

            expect(prisma.postCategory.findMany).toHaveBeenCalledWith({
                where: {},
                select: expect.any(Object),
                orderBy: { name: "asc" },
            });
        });
    });

    describe("createCategory", () => {
        it("cria categoria com sucesso", async () => {
            vi.mocked(prisma.postCategory.create).mockResolvedValue({ id: "cat-1", name: "Inovação" });

            const result = await createCategory("Inovação");
            expect(result).toEqual({ id: "cat-1", name: "Inovação" });
        });

        it("lança ConflictError quando categoria duplicada (P2002)", async () => {
            const p2002 = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                code: "P2002",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.postCategory.create).mockRejectedValue(p2002);

            await expect(createCategory("Inovação")).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("Já existe categoria"),
            });
        });
    });

    describe("updateCategory", () => {
        it("atualiza nome com sucesso", async () => {
            vi.mocked(prisma.postCategory.update).mockResolvedValue({ id: "cat-1", name: "Novo Nome" });

            const result = await updateCategory("cat-1", "Novo Nome");
            expect(result).toEqual({ id: "cat-1", name: "Novo Nome" });
        });

        it("lança NotFoundError quando categoria não existe (P2025)", async () => {
            const p2025 = new Prisma.PrismaClientKnownRequestError("Record not found", {
                code: "P2025",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.postCategory.update).mockRejectedValue(p2025);

            await expect(updateCategory("cat-x", "Nome")).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND",
            });
        });
    });

    describe("deleteCategory", () => {
        it("deleta categoria com sucesso", async () => {
            vi.mocked(prisma.postCategory.delete).mockResolvedValue({ id: "cat-1", name: "Robótica" });

            const result = await deleteCategory("cat-1");
            expect(result).toEqual({ id: "cat-1", name: "Robótica" });
        });

        it("lança ConflictError se possui posts vinculados (P2003)", async () => {
            const p2003 = new Prisma.PrismaClientKnownRequestError("Foreign key violation", {
                code: "P2003",
                clientVersion: "7.0.0",
            });
            vi.mocked(prisma.postCategory.delete).mockRejectedValue(p2003);

            await expect(deleteCategory("cat-1")).rejects.toMatchObject({
                statusCode: 409,
                message: expect.stringContaining("possui posts vinculados"),
            });
        });
    });
});
