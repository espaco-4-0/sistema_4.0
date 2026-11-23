import { createComment } from "@/src/infra/modules/blog/blog-interaction.service";
import { postCommentSchema } from "@/src/infra/modules/blog/blog.schema";
import { UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");

        const body = await req.json();
        const validatedPost = postCommentSchema.safeParse(body);
        if (!validatedPost.success) throw new ValidationError("Dados inválidos");

        await createComment(session.user.id, validatedPost.data.postId, validatedPost.data.comment);

        return NextResponse.json({ message: "Comentário criado com sucesso" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
