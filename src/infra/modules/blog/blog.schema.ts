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
    slug: z.string().trim().min(3).max(75),
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

export const postIdBlogSchema = z.string().trim().min(1).max(36);
export const commentIdBlogSchema = z.string().trim().min(1).max(36);

export const postSlugBlogSchema = z.string().trim().min(3).max(75);

export const postCommentSchema = z.object({
    postId: z.string().trim().min(1).max(36),
    comment: z.string().trim().min(1).max(1000),
});

export const patchBlogSchema = z.object({
    id: z.string().trim().min(1).max(36),
    published: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean()),
});
