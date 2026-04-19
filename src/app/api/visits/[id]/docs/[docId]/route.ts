import { getSignedDownloadUrl } from "@/src/lib/supabase-server";
import { prisma } from "@/src/infra/data/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../auth/[...nextauth]/route";

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return { role: (session.user as any).role as string };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
    try {
        const user = await getSessionUser();

        if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        const { docId: docIdParam } = await params;
        const docId = parseInt(docIdParam, 10);

        if (!docId || isNaN(docId)) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const doc = await prisma.visitDocumento.findUnique({ where: { id: docId } });

        if (!doc) {
            return NextResponse.json({ message: "Documento não encontrado" }, { status: 404 });
        }

        // Gera URL assinada (válida por 1h) e redireciona o browser para o Supabase
        const signedUrl = await getSignedDownloadUrl(doc.storagePath);

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error("[GET /api/visits/[id]/docs/[docId]]", error);
        return NextResponse.json({ message: "Erro ao gerar link de download", error: String(error) }, { status: 500 });
    }
}
