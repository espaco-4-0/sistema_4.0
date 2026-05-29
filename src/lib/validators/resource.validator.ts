import { z } from "zod";

const ResourceStatusEnum = z.enum(["AVAILABLE", "RESERVED", "OUT_OF_STOCK"]);

export const createResourceSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    quantityAdded: z.number().int().positive("Quantity must be a positive integer"),
    quantityInStock: z.number().int().min(0).optional(),
    status: ResourceStatusEnum.optional().default("AVAILABLE"),
    productId: z.string().cuid("Invalid productId"),
    categoryId: z.string().cuid("Invalid categoryId"),
});

export const importResourcesSchema = z.object({
    resources: z
        .array(createResourceSchema)
        .min(1, "At least one resource is required")
        .max(500, "Maximum 500 resources per import batch"),
});

export const updateResourceSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    quantityAdded: z.number().int().positive().optional(),
    quantityInStock: z.number().int().min(0).optional(),
    status: ResourceStatusEnum.optional(),
    productId: z.string().cuid("Invalid productId").optional(),
    categoryId: z.string().cuid("Invalid categoryId").optional(),
});

export const listResourcesSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    category_id: z.string().cuid().optional(),
    product_id: z.string().cuid().optional(),
    status: ResourceStatusEnum.optional(),
    search: z.string().min(1).max(100).optional(),
});

export type CreateResourceDTO = z.infer<typeof createResourceSchema>;
export type UpdateResourceDTO = z.infer<typeof updateResourceSchema>;
export type ImportResourcesDTO = z.infer<typeof importResourcesSchema>;
export type ListResourcesDTO = z.infer<typeof listResourcesSchema>;
