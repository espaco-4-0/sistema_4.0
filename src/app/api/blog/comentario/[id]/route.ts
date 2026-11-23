import { deleteComment } from "@/src/infra/modules/blog/blog-interaction.service";
import { commentIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");

        const commentId = (await params).id;
        const validatedCommentId = commentIdBlogSchema.safeParse(commentId);
        if (!validatedCommentId.success) throw new ValidationError("Dado inválido");

        const isAdmin = session.user.role === "ADMIN";
        await deleteComment(validatedCommentId.data, session.user.id, isAdmin);

        return NextResponse.json({ status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
