import {
    deletePostBySlug,
    findPostBySlug,
    updatePostBySlug,
    updatePostVisibility,
} from "@/src/infra/modules/blog/blog-post.service";
import { ALLOWED_TYPES, postSlugBlogSchema, updateBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { storage } from "@/src/lib/storage";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Não autenticado");
    if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");
    return session;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) throw new ValidationError("Dado inválido");

        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN";

        const post = await findPostBySlug(validatedSlug.data, session?.user?.id, isAdmin);

        return NextResponse.json({ data: post }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await requireAdmin();

        const slug: string = (await params).slug;
        const { published } = await req.json();

        const updatedPost = await updatePostVisibility(slug, published);

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await requireAdmin();

        const slug: string = (await params).slug;
        await deletePostBySlug(slug);

        return NextResponse.json({ message: "Post excluído com sucesso" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await requireAdmin();

        const currentSlug: string = (await params).slug;
        const formData = await req.formData();
        const validatedData = updateBlogSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedData.success) {
            throw new ValidationError("Dados inválidos");
        }

        const { title, slug: newSlug, content, published, file, summary, category, authorId } = validatedData.data;

        let photoUrl: string | undefined = undefined;

        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const detected = await fileTypeFromBuffer(fileBuffer);

            if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
                return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
            }

            if (published) {
                const { path, url } = await storage.uploadPublic(file, `posts/${newSlug}`, detected.mime);
                photoUrl = url || path;
            } else {
                const { path } = await storage.uploadPrivate(file, `posts/${newSlug}`, detected.mime);
                photoUrl = path;
            }
        }

        const updatedPost = await updatePostBySlug(currentSlug, {
            title,
            newSlug,
            content,
            summary,
            published,
            category,
            authorId,
            photoUrl,
            hasNewPhoto: !!file,
        });

        return NextResponse.json({ data: updatedPost }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
