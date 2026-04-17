import { getUrlPrivateSchema } from "@/src/infra/modules/blog/blog.schema";
import { storage } from "@/src/lib/storage";
import { prisma } from "@/src/ui/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

const TOKEN_EXPIRE_TIME_IN_SECONDS = 60 * 10;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const validatedId = getUrlPrivateSchema.safeParse(await params);
        if (!validatedId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const path = await prisma.postFoto.findUnique({
            where: {
                id: validatedId.data.id,
            },
            select: { url: true },
        });	

        if (!path) return NextResponse.json({ message: "Id inexistente" }, { status: 404 });

        const privateUrl = await storage.getPrivateUrl(path.url, TOKEN_EXPIRE_TIME_IN_SECONDS);

        return NextResponse.json({ message: "Url gerado com sucesso", url: privateUrl }, { status: 200 });
    } catch (err) {
        console.error("Internal Error: ", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
