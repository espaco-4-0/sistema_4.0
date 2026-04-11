import { z } from "zod";

export const getBlogSchema = z.object({
    quantity: z.coerce.number().int().positive().optional(),
    category: z.string().trim().min(1).max(30).optional(),
    name: z.string().trim().min(1).max(60).optional(),
    includeArchived: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean().optional()),
});
