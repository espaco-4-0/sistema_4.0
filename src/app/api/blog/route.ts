import { createPost, listPosts } from "@/src/infra/modules/blog/blog-post.service";
import { ALLOWED_TYPES, getBlogSchema, postBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { storage } from "@/src/lib/storage";
import { logger } from "@/src/ui/lib/logger";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const paramsOrUndefined = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [key, value === "" ? undefined : value])
        );

        const validatedData = getBlogSchema.safeParse(paramsOrUndefined);
        if (!validatedData.success) {
            throw new ValidationError("Dados inválidos");
        }

        const { category, name, includeArchived, quantity, page, limit, published } = validatedData.data;

        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN";

        if (includeArchived === true) {
            if (!session) throw new UnauthorizedError("Não autenticado");
            if (!isAdmin) throw new ForbiddenError("Não autorizado");
        }

        const result = await listPosts(
            {
                category,
                name,
                includeArchived,
                quantity,
                page,
                limit,
                published,
            },
            isAdmin
        );

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    let uploadedPath: string | null = null;

    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const formData = await req.formData();
        const dataObject = Object.fromEntries(formData.entries());
        const validatedData = postBlogSchema.safeParse(dataObject);
        if (!validatedData.success) {
            throw new ValidationError("Dados inválidos");
        }

        const { title, slug, content, published, file, summary, category, authorId } = validatedData.data;

        if (!category) {
            throw new ValidationError("Categoria é obrigatória");
        }

        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        const detected = await fileTypeFromBuffer(fileBuffer);
        if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
            return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
        }

        let photoUrl: string;
        let publicUrl: string | undefined;

        if (published) {
            const uploadRes = await storage.uploadPublic(file, `posts/${slug}`, detected.mime);
            uploadedPath = uploadRes.path;
            publicUrl = uploadRes.url;
            photoUrl = uploadRes.url || uploadRes.path;
        } else {
            const uploadRes = await storage.uploadPrivate(file, `posts/${slug}`, detected.mime);
            uploadedPath = uploadRes.path;
            photoUrl = uploadRes.path;
        }

        await createPost({
            title,
            slug,
            content,
            summary,
            published,
            category,
            authorId: authorId || session.user.id,
            photoUrl,
        });

        return NextResponse.json({ message: "Post criado", ...(publicUrl && { url: publicUrl }) }, { status: 201 });
    } catch (err) {
        if (uploadedPath) {
            try {
                await storage.delete(uploadedPath);
            } catch (deleteErr) {
                logger.warn({ deleteErr, path: uploadedPath }, "Falha ao remover arquivo após erro no post");
            }
        }
        return handleError(err);
    }
}
