import { InventoryCategory } from "@/src/generated/prisma/client";
import { z } from "zod";

export const createResourceSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    quantityAdded: z.coerce.number().int().min(0, "Quantity must be 0 or positive"),
    quantityInStock: z.coerce.number().int().min(0).optional(),
    status: z.string().optional().default("AVAILABLE"),
    productId: z.string().min(1, "Product is required"),
    categoryId: z.string().min(1, "Category is required"),
});

export const importResourcesSchema = z.object({
    resources: z
        .array(createResourceSchema)
        .min(1, "At least one resource is required")
        .max(500, "Maximum 500 resources per import batch"),
});

export const updateResourceSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    quantityAdded: z.coerce.number().int().min(0).optional(),
    quantityInStock: z.coerce.number().int().min(0).optional(),
    status: z.string().optional(),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
});

export const listResourcesSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    category_id: z.string().optional(),
    product_id: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
});

export type CreateResourceDTO = z.infer<typeof createResourceSchema>;
export type UpdateResourceDTO = z.infer<typeof updateResourceSchema>;
export type ImportResourcesDTO = z.infer<typeof importResourcesSchema>;
export type ListResourcesDTO = z.infer<typeof listResourcesSchema>;

export function mapStringToCategory(val: string): InventoryCategory {
    const norm = val.toUpperCase().trim();
    if (norm.includes("COMPUTADOR") || norm.includes("EQUIPAMENTO") || norm.includes("EQUIPMENT")) {
        return "EQUIPMENT";
    }
    if (
        norm.includes("MATERIAL") ||
        norm.includes("COMPONENTE") ||
        norm.includes("SENSOR") ||
        norm.includes("MOTOR") ||
        norm.includes("MICROCONTROLADOR") ||
        norm.includes("ARDUINO") ||
        norm.includes("RASPBERRY") ||
        norm.includes("PLACAS")
    ) {
        return "MATERIAL";
    }
    if (norm.includes("SOFTWARE") || norm.includes("SISTEMA")) {
        return "SOFTWARE";
    }
    return "OTHER";
}

export function mapCategoryToString(cat: InventoryCategory): string {
    switch (cat) {
        case "EQUIPMENT":
            return "Equipamentos";
        case "MATERIAL":
            return "Componentes / Sensores";
        case "SOFTWARE":
            return "Software";
        default:
            return "Outros";
    }
}
