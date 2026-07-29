import { prisma } from "@/src/infra/data/prisma";

import { NotFoundError } from "../errors/AppError";
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
        return resourceRepository.create(data);
    },

    async bulkImport(dto: ImportResourcesDTO) {
        const { resources } = dto;
        let imported = 0;
        const failed = 0;
        const errors: Array<{ index: number; reason: string }> = [];

        await prisma.$transaction(async (tx) => {
            const records = resources.map((r) => ({
                name: r.name,
                quantityAdded: r.quantityAdded,
                quantityInStock: r.quantityInStock ?? r.quantityAdded,
                status: r.status ?? "AVAILABLE",
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

        return resourceRepository.update(id, data);
    },

    async delete(id: string) {
        const existing = await resourceRepository.findById(id);
        if (!existing) throw new NotFoundError("Resource", id);

        await resourceRepository.softDelete(id);
        return { message: "Resource deleted successfully" };
    },
};
