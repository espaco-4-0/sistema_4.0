import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { createCategorySchema, postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;
        const { name } = await req.json();

        const validatedId = postIdBlogSchema.safeParse(id);
        if (!validatedId.success) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

        const validatedName = createCategorySchema.safeParse(name);
        if (!validatedName.success) return NextResponse.json({ error: "Nome inválido" }, { status: 422 });

        await prisma.postCategory.update({
            where: { id },
            data: { name: validatedName.data },
        });

        return NextResponse.json({ message: "Categoria atualizada com sucesso" }, { status: 200 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
            return NextResponse.json({ error: "Já existe uma categoria com esse nome" }, { status: 409 });
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;
        const validatedId = postIdBlogSchema.safeParse(id);
        if (!validatedId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        await prisma.postCategory.delete({
            where: { id },
        });

        return NextResponse.json({ status: 200 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025")
                return NextResponse.json({ error: "Não há categoria com esse ID" }, { status: 404 });
            if (err.code === "P2003")
                return NextResponse.json(
                    { error: "Não é possível excluir uma categoria que possui posts vinculados" },
                    { status: 409 }
                );
        }
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
