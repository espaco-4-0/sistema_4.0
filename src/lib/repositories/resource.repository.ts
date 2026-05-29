import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { CreateResourceDTO, ListResourcesDTO, UpdateResourceDTO } from "../validators/resource.validator";

const resourceSelect = {
    id: true,
    name: true,
    quantityAdded: true,
    quantityInStock: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.ResourceSelect;

export const resourceRepository = {
    async findMany(filters: ListResourcesDTO) {
        const { page, limit, category_id, product_id, status, search } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.ResourceWhereInput = {
            deletedAt: null,
            ...(category_id && { categoryId: category_id }),
            ...(product_id && { productId: product_id }),
            ...(status && { status }),
            ...(search && {
                OR: [{ name: { contains: search, mode: "insensitive" } }],
            }),
        };

        const [data, total] = await prisma.$transaction([
            prisma.resource.findMany({
                where,
                select: resourceSelect,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.resource.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    },

    async findById(id: string) {
        return prisma.resource.findFirst({
            where: { id, deletedAt: null },
            select: resourceSelect,
        });
    },

    async create(data: CreateResourceDTO) {
        return prisma.resource.create({
            data: {
                name: data.name,
                quantityAdded: data.quantityAdded,
                quantityInStock: data.quantityInStock ?? data.quantityAdded,
                status: data.status ?? "AVAILABLE",
                productId: data.productId,
                categoryId: data.categoryId,
            },
            select: resourceSelect,
        });
    },

    async update(id: string, data: UpdateResourceDTO) {
        return prisma.resource.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.quantityAdded !== undefined && { quantityAdded: data.quantityAdded }),
                ...(data.quantityInStock !== undefined && { quantityInStock: data.quantityInStock }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.productId !== undefined && { productId: data.productId }),
                ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            },
            select: resourceSelect,
        });
    },

    async softDelete(id: string) {
        return prisma.resource.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};
