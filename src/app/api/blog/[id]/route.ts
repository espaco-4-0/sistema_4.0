import { prisma } from "@/src/infra/data/prisma";
import { patchBlogSchema, postIdBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { storage } from "@/src/lib/storage";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

const TOKEN_EXPIRE_TIME_IN_SECONDS = 60 * 10;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const validatedId = postIdBlogSchema.safeParse(await params);
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;
        const isPublic = req.nextUrl.searchParams.get("isPublic");

        const validated = patchBlogSchema.safeParse({ id, published: isPublic });
        if (!validated.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const post = await prisma.post.findUnique({
            where: { id: validated.data.id },
            select: { publicado: true },
        });
        if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
        if (post.publicado === validated.data.published)
            return NextResponse.json({
                error: `O post já se encontra com a visibilidade ${post.publicado ? "pública" : "privada"}`,
            });

        const photo = await prisma.postFoto.findUnique({
            where: { postId: validated.data.id },
            select: { url: true },
        });
        if (!photo) return NextResponse.json({ error: "Foto do post não encontrada" }, { status: 404 });

        await prisma.post.update({
            where: { id: validated.data.id },
            data: { publicado: validated.data.published },
        });

        try {
            const { path, url } = await storage.changeVisibility(photo.url, validated.data.published);

            await prisma.postFoto.update({
                where: { postId: validated.data.id },
                data: { url: url ?? path },
            });

            return NextResponse.json(
                {
                    message: `Visibilidade alterada para ${validated.data.published ? "Público" : "Privado"} com sucesso`,
                },
                { status: 200 }
            );
        } catch (storageErr) {
            await prisma.post.update({
                where: { id: validated.data.id },
                data: { publicado: !validated.data.published },
            });

            throw storageErr;
        }
    } catch (err) {
        console.error("Internal error: ", err);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const validatedId = postIdBlogSchema.safeParse(await params);
        if (!validatedId.success) return NextResponse.json({ error: "Dado inválido" }, { status: 422 });

        const photo = await prisma.postFoto.findUnique({
            where: { postId: validatedId.data.id },
            select: { url: true },
        });

        const post = await prisma.post.findUnique({
            where: { id: validatedId.data.id },
            select: { publicado: true },
        });

        if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

        await prisma.post.delete({ where: { id: validatedId.data.id } });

        if (photo) {
            await storage.delete(photo.url, !post.publicado).catch((err) => {
                console.warn("Post deletado mas falha ao remover imagem do storage:", err);
            });
        }

        return NextResponse.json({ message: "Post deletado com sucesso" }, { status: 200 });
    } catch (err) {
        console.error("Internal error: ", err);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
