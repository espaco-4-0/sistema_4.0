import {
    deleteProjectFile,
    getFileDownloadUrl,
    getProjectFile,
} from "@/src/infra/modules/projects/project-files.service";
import { canManageProject } from "@/src/infra/modules/projects/projects.service";
import { requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const file = await getProjectFile(id);
        if (!file) {
            return NextResponse.json({ message: "Arquivo não encontrado" }, { status: 404 });
        }

        const signedUrl = await getFileDownloadUrl(file.url);

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error("[GET /api/files/[id]]", error);
        return NextResponse.json({ message: "Erro ao gerar link de download" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const id = rawId?.trim();
        if (!id) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const file = await getProjectFile(id);
        if (!file) {
            return NextResponse.json({ message: "Arquivo não encontrado" }, { status: 404 });
        }

        const canManage = await canManageProject(file.projectId, user.id, user.role);
        const isUploader = file.uploadedById === user.id;

        if (!canManage && !isUploader) {
            return NextResponse.json({ message: "Sem permissão para remover este arquivo" }, { status: 403 });
        }

        await deleteProjectFile(id, file.url);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DELETE /api/files/[id]]", error);
        return NextResponse.json({ message: "Erro ao remover arquivo" }, { status: 500 });
    }
}
