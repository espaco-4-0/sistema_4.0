import { createLike } from "@/src/infra/modules/blog/blog-interaction.service";
import { postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");

        const { postId } = await req.json();
        const validatedPostId = postIdBlogSchema.safeParse(postId);
        if (!validatedPostId.success) throw new ValidationError("Dados inválidos");

        await createLike(session.user.id, validatedPostId.data);

        return NextResponse.json({ message: "Post curtido com sucesso" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
