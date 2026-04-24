import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;
        const validatedId = postIdBlogSchema.safeParse(id);
        if (!validatedId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 500 });

        await prisma.postCategoria.delete({
            where: { id },
        });

        return NextResponse.json({ status: 200 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025")
            return NextResponse.json({ error: "Não há categoria com esse ID" }, { status: 404 });
        console.error(err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
