// src/lib/repositories/resource.repository.ts
import { prisma } from "@/lib/prisma";
import { Prisma, ResourceStatus } from "@prisma/client";

import { CreateResourceDTO, ListResourcesDTO, UpdateResourceDTO } from "../validators/resource.validator";

// ─── Shared select shape ───────────────────────────────────────
const resourceSelect = {
    id: true,
    name: true,
    quantityAdded: true,
    quantityInStock: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    product: {
        select: { id: true, name: true },
    },
    category: {
        select: { id: true, name: true },
    },
} satisfies Prisma.ResourceSelect;

// ─── Repository ───────────────────────────────────────────────
export const resourceRepository = {
    // ── List with filters + pagination ──────────────────────────
    async findMany(filters: ListResourcesDTO) {
        const { page, limit, category_id, product_id, status, search } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.ResourceWhereInput = {
            deletedAt: null, // exclude soft-deleted
            ...(category_id && { categoryId: category_id }),
            ...(product_id && { productId: product_id }),
            ...(status && { status: status as ResourceStatus }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { product: { name: { contains: search, mode: "insensitive" } } },
                ],
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
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // ── Find one (excluding soft-deleted) ───────────────────────
    async findById(id: string) {
        return prisma.resource.findFirst({
            where: { id, deletedAt: null },
            select: resourceSelect,
        });
    },

    // ── Create single ────────────────────────────────────────────
    async create(data: CreateResourceDTO) {
        return prisma.resource.create({
            data: {
                name: data.name,
                quantityAdded: data.quantityAdded,
                quantityInStock: data.quantityInStock ?? data.quantityAdded,
                status: data.status as ResourceStatus,
                productId: data.productId,
                categoryId: data.categoryId,
            },
            select: resourceSelect,
        });
    },

    // ── Bulk insert (single optimized query) ────────────────────
    async createMany(
        records: Array<{
            name: string;
            quantityAdded: number;
            quantityInStock: number;
            status: ResourceStatus;
            productId: string;
            categoryId: string;
        }>
    ) {
        return prisma.resource.createMany({
            data: records,
            skipDuplicates: false,
        });
    },

    // ── Partial update ───────────────────────────────────────────
    async update(id: string, data: UpdateResourceDTO) {
        return prisma.resource.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.quantityAdded !== undefined && { quantityAdded: data.quantityAdded }),
                ...(data.quantityInStock !== undefined && { quantityInStock: data.quantityInStock }),
                ...(data.status !== undefined && { status: data.status as ResourceStatus }),
                ...(data.productId !== undefined && { productId: data.productId }),
                ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            },
            select: resourceSelect,
        });
    },

    // ── Soft delete ──────────────────────────────────────────────
    async softDelete(id: string) {
        return prisma.resource.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    // ── Validate that all product IDs exist ─────────────────────
    async validateProductIds(productIds: string[]): Promise<string[]> {
        const unique = [...new Set(productIds)];
        const found = await prisma.product.findMany({
            where: { id: { in: unique } },
            select: { id: true },
        });
        const foundSet = new Set(found.map((p) => p.id));
        return unique.filter((id) => !foundSet.has(id)); // returns MISSING ids
    },

    // ── Validate that all category IDs exist ────────────────────
    async validateCategoryIds(categoryIds: string[]): Promise<string[]> {
        const unique = [...new Set(categoryIds)];
        const found = await prisma.category.findMany({
            where: { id: { in: unique } },
            select: { id: true },
        });
        const foundSet = new Set(found.map((c) => c.id));
        return unique.filter((id) => !foundSet.has(id));
    },
};
