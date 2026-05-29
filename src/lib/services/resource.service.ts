import { prisma } from "@/lib/prisma";
import { ResourceStatus } from "@prisma/client";

import { NotFoundError, ValidationError } from "../errors/errorHandler";
import { resourceRepository } from "../repositories/resource.repository";
import {
    CreateResourceDTO,
    ImportResourcesDTO,
    ListResourcesDTO,
    UpdateResourceDTO,
} from "../validators/resource.validator";

export const resourceService = {
    async list(filters: ListResourcesDTO) {
        return resourceRepository.findMany(filters);
    },

    async getById(id: string) {
        const resource = await resourceRepository.findById(id);
        if (!resource) throw new NotFoundError("Resource", id);
        return resource;
    },

    async create(data: CreateResourceDTO) {
        const missingProducts = await resourceRepository.validateProductIds([data.productId]);
        if (missingProducts.length > 0) {
            throw new ValidationError(`Product "${data.productId}" does not exist`);
        }

        const missingCategories = await resourceRepository.validateCategoryIds([data.categoryId]);
        if (missingCategories.length > 0) {
            throw new ValidationError(`Category "${data.categoryId}" does not exist`);
        }

        return resourceRepository.create(data);
    },

    async bulkImport(dto: ImportResourcesDTO) {
        const { resources } = dto;
        let imported = 0;
        let failed = 0;
        const errors: Array<{ index: number; reason: string }> = [];

        const allProductIds = resources.map((r) => r.productId);
        const missingProducts = await resourceRepository.validateProductIds(allProductIds);
        if (missingProducts.length > 0) {
            throw new ValidationError(`The following product IDs do not exist: ${missingProducts.join(", ")}`);
        }

        const allCategoryIds = resources.map((r) => r.categoryId);
        const missingCategories = await resourceRepository.validateCategoryIds(allCategoryIds);
        if (missingCategories.length > 0) {
            throw new ValidationError(`The following category IDs do not exist: ${missingCategories.join(", ")}`);
        }

        await prisma.$transaction(async (tx) => {
            const records = resources.map((r) => ({
                name: r.name,
                quantityAdded: r.quantityAdded,
                quantityInStock: r.quantityInStock ?? r.quantityAdded,
                status: (r.status ?? "AVAILABLE") as ResourceStatus,
                productId: r.productId,
                categoryId: r.categoryId,
            }));

            const result = await tx.resource.createMany({
                data: records,
                skipDuplicates: false,
            });

            imported = result.count;
        });

        return { imported, failed, errors };
    },

    async update(id: string, data: UpdateResourceDTO) {
        const existing = await resourceRepository.findById(id);
        if (!existing) throw new NotFoundError("Resource", id);

        if (data.productId) {
            const missing = await resourceRepository.validateProductIds([data.productId]);
            if (missing.length > 0) {
                throw new ValidationError(`Product "${data.productId}" does not exist`);
            }
        }

        if (data.categoryId) {
            const missing = await resourceRepository.validateCategoryIds([data.categoryId]);
            if (missing.length > 0) {
                throw new ValidationError(`Category "${data.categoryId}" does not exist`);
            }
        }

        return resourceRepository.update(id, data);
    },

    async delete(id: string) {
        const existing = await resourceRepository.findById(id);
        if (!existing) throw new NotFoundError("Resource", id);

        await resourceRepository.softDelete(id);
        return { message: "Resource deleted successfully" };
    },
};
