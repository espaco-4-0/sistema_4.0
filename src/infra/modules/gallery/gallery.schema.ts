import z from "zod";

const imageSchema = z.custom<File>(
    (val) => {
        if (!(val instanceof File)) return false;
        if (val.size === 0) return false;
        if (val.name.length === 0) return false;
        return true;
    },
    { message: "Arquivo inválido" }
);

export const getGalleryItemsSchema = z.object({
    quantity: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(9),
    isActive: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean().optional()),
    wordFilter: z.string().trim().min(1).max(100).optional(),
    origin: z.enum(["UPLOAD", "POST"]).optional(),
});

export const createGalleryItemSchema = z
    .object({
    title: z.string().min(1).max(100),
        isActive: z.preprocess((val) => {
            if (val === "true") return true;
            if (val === "false") return false;
            return val;
        }, z.boolean()),
        origin: z.preprocess((val) => val || "UPLOAD", z.enum(["UPLOAD", "POST"])),
        file: imageSchema.optional(),
        postId: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.origin === "UPLOAD") return !!data.file;
            if (data.origin === "POST") return !!data.postId;
            return true;
        },
        {
            message: "Arquivo é obrigatório para UPLOAD e postId é obrigatório para POST",
            path: ["origin"],
        }
    );
export const updateGalleryActiveSchema = z.object({
    isActive: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean()),
    title: z.string().min(1).max(100),
});
