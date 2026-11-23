import { deleteCategory, updateCategory } from "@/src/infra/modules/blog/blog-category.service";
import { createCategorySchema, postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const { id } = await params;
        const { name } = await req.json();

        const validatedId = postIdBlogSchema.safeParse(id);
        if (!validatedId.success) throw new ValidationError("ID inválido");

        const validatedName = createCategorySchema.safeParse(name);
        if (!validatedName.success) throw new ValidationError("Nome inválido");

        await updateCategory(validatedId.data, validatedName.data);

        return NextResponse.json({ message: "Categoria atualizada com sucesso" }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const { id } = await params;
        const validatedId = postIdBlogSchema.safeParse(id);
        if (!validatedId.success) throw new ValidationError("Dado inválido");

        await deleteCategory(validatedId.data);

        return NextResponse.json({ status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
