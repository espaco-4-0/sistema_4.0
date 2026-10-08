import { deleteLike } from "@/src/infra/modules/blog/blog-interaction.service";
import { postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");

        const postId = (await params).id;
        const validatedPostId = postIdBlogSchema.safeParse(postId);
        if (!validatedPostId.success) throw new ValidationError("Dado inválido");

        await deleteLike(session.user.id, validatedPostId.data);

        return NextResponse.json({ status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
