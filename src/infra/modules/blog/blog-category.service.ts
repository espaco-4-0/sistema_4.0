import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { ConflictError, NotFoundError } from "@/src/lib/errors/AppError";

export type CategoryWithCount = {
    id: string;
    nome: string;
    _count: {
        posts: number;
    };
};

export async function listCategories(includeAll = false): Promise<CategoryWithCount[]> {
    const categories = await prisma.postCategory.findMany({
        where: includeAll
            ? {}
            : {
                  Post: {
                      some: {
                          isPublished: true,
                      },
                  },
              },
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    Post: {
                        where: { isPublished: true },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    return categories.map((cat) => ({
        id: cat.id,
        nome: cat.name,
        _count: {
            posts: cat._count.Post,
        },
    }));
}

export async function createCategory(name: string) {
    try {
        return await prisma.postCategory.create({
            data: { name },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new ConflictError("Já existe categoria com esse nome");
        }
        throw err;
    }
}

export async function updateCategory(id: string, name: string) {
    try {
        return await prisma.postCategory.update({
            where: { id },
            data: { name },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                throw new ConflictError("Já existe uma categoria com esse nome");
            }
            if (err.code === "P2025") {
                throw new NotFoundError("Categoria", id);
            }
        }
        throw err;
    }
}

export async function deleteCategory(id: string) {
    try {
        return await prisma.postCategory.delete({
            where: { id },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                throw new NotFoundError("Categoria", id);
            }
            if (err.code === "P2003") {
                throw new ConflictError("Não é possível excluir uma categoria que possui posts vinculados");
            }
        }
        throw err;
    }
}
