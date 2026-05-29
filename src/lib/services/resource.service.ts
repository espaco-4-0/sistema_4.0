import { prisma } from "@/src/infra/data/prisma";
import { InventoryCategory } from "@/src/generated/prisma/client";

import { NotFoundError, ValidationError } from "../errors/AppError";
import { resourceRepository } from "../repositories/resource.repository";
import {
    CreateResourceDTO,
    ImportResourcesDTO,
    ListResourcesDTO,
    UpdateResourceDTO,
    mapStringToCategory,
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
        if (data.projectId) {
            const projectExists = await prisma.project.findUnique({ where: { id: data.projectId } });
            if (!projectExists) {
                throw new ValidationError(`Project "${data.projectId}" does not exist`);
            }
        }

        if (data.responsibleId) {
            const userExists = await prisma.user.findUnique({ where: { id: data.responsibleId } });
            if (!userExists) {
                throw new ValidationError(`User "${data.responsibleId}" does not exist`);
            }
        }

        return resourceRepository.create(data);
    },

    async bulkImport(dto: ImportResourcesDTO) {
        const { resources } = dto;
        let imported = 0;
        const failed = 0;
        const errors: Array<{ index: number; reason: string }> = [];

        const allProjectIds = resources.map((r) => r.projectId).filter(Boolean) as string[];
        if (allProjectIds.length > 0) {
            const foundProjects = await prisma.project.findMany({
                where: { id: { in: allProjectIds } },
                select: { id: true },
            });
            const foundProjectSet = new Set(foundProjects.map((p) => p.id));
            const missingProjects = allProjectIds.filter((id) => !foundProjectSet.has(id));
            if (missingProjects.length > 0) {
                throw new ValidationError(`The following project IDs do not exist: ${missingProjects.join(", ")}`);
            }
        }

        const allUserIds = resources.map((r) => r.responsibleId).filter(Boolean) as string[];
        if (allUserIds.length > 0) {
            const foundUsers = await prisma.user.findMany({
                where: { id: { in: allUserIds } },
                select: { id: true },
            });
            const foundUserSet = new Set(foundUsers.map((u) => u.id));
            const missingUsers = allUserIds.filter((id) => !foundUserSet.has(id));
            if (missingUsers.length > 0) {
                throw new ValidationError(`The following responsible user IDs do not exist: ${missingUsers.join(", ")}`);
            }
        }

        await prisma.$transaction(async (tx) => {
            const records = resources.map((r) => ({
                name: r.name,
                description: r.description ?? null,
                category: mapStringToCategory(r.category) as InventoryCategory,
                quantity: r.quantity,
                unit: r.unit ?? "un",
                location: r.location ?? "Sem localização",
                isActive: r.isActive ?? true,
                responsibleId: r.responsibleId ?? null,
                projectId: r.projectId ?? null,
            }));

            const result = await tx.inventoryItem.createMany({
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

        if (data.projectId) {
            const projectExists = await prisma.project.findUnique({ where: { id: data.projectId } });
            if (!projectExists) {
                throw new ValidationError(`Project "${data.projectId}" does not exist`);
            }
        }

        if (data.responsibleId) {
            const userExists = await prisma.user.findUnique({ where: { id: data.responsibleId } });
            if (!userExists) {
                throw new ValidationError(`User "${data.responsibleId}" does not exist`);
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
