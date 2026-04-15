import { z } from "zod";

const imageSchema = z.custom<File>(
    (val) => {
        if (!(val instanceof File)) return false;
        if (val.size === 0) return false;
        if (val.name.length === 0) return false;
        return true;
    },
    { message: "Arquivo inválido" }
);

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

export const postBlogSchema = z.object({
    title: z.string().trim().min(1).max(60),
    slug: z.string().trim().min(3).max(30),
    summary: z.string().trim().min(100).max(100).optional(),
    content: z.string().trim().min(100).max(2000),
    published: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean()),
    category: z.string().trim().min(1).max(30).optional(),
    file: imageSchema,
});
