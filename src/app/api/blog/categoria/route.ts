import { createCategory, listCategories } from "@/src/infra/modules/blog/blog-category.service";
import { createCategorySchema } from "@/src/infra/modules/blog/blog.schema";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeAll = searchParams.get("includeAll") === "true";

        const mappedCategories = await listCategories(includeAll);

        return NextResponse.json({ data: mappedCategories }, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new UnauthorizedError("Não autenticado");
        if (session.user.role !== "ADMIN") throw new ForbiddenError("Não autorizado");

        const { name } = await req.json();
        const validatedBody = createCategorySchema.safeParse(name);
        if (!validatedBody.success) {
            throw new ValidationError("Dados inválidos");
        }

        await createCategory(validatedBody.data);

        return NextResponse.json({ message: "Categoria criada com sucesso" }, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
}
