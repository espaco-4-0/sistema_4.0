import { prisma } from "@/src/infra/data/prisma";
import { updateGalleryActiveSchema } from "@/src/infra/modules/gallery/gallery.schema";
import { storage } from "@/src/lib/storage";
import { getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;
        const body = await req.json();

        const validatedData = updateGalleryActiveSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json({ error: "Dados inválidos", data: validatedData.error }, { status: 422 });
        }

        const { isActive, title } = validatedData.data;

        const existingItem = await prisma.galleryItem.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json({ error: "Item da galeria não encontrado" }, { status: 404 });
        }

        if (isActive) {
            const activeCount = await prisma.galleryItem.count({
                where: { isActive: true },
            });

            if (activeCount >= 6) {
                return NextResponse.json({ error: "Limite de 6 imagens excedido" }, { status: 409 });
            }
        }

        const updatedItem = await prisma.$transaction(async (tx) => {
            let finalUrl = existingItem.url;

            if (existingItem.origin === "UPLOAD" && isActive !== existingItem.isActive) {
                const result = await storage.changeVisibility(existingItem.url, isActive);
                finalUrl = result.url || result.path;
            }

            return await tx.galleryItem.update({
                where: { id },
                data: {
                    isActive,
                    title,
                    url: finalUrl,
                },
            });
        });

        return NextResponse.json({ data: updatedItem }, { status: 200 });
    } catch (err) {
        logger.error({ err, route: getRequestInfo(req) }, "Erro ao atualizar item da galeria");

        if (err.code === "P2002") {
            return NextResponse.json({ error: "Já existe uma imagem com este título" }, { status: 409 });
        }

        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

        const { id } = await params;

        const existingItem = await prisma.galleryItem.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json({ error: "Item da galeria não encontrado" }, { status: 404 });
        }

        await prisma.galleryItem.delete({
            where: { id },
        });

        return NextResponse.json({ status: 204 });
    } catch (err) {
        logger.error({ err }, "Erro ao atualizar status da imagem na galeria");
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
