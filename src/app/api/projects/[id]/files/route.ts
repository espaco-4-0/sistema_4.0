import { storeProjectFile, validateUpload } from "@/src/infra/modules/projects/project-files.service";
import { canManageProject, getProject } from "@/src/infra/modules/projects/projects.service";
import { requireUser } from "@/src/infra/modules/projects/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const projectId = rawId?.trim();
        if (!projectId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        return NextResponse.json({ data: project.ProjectFile }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/projects/[id]/files]", error);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { user, response } = await requireUser();
        if (response) return response;

        const { id: rawId } = await params;
        const projectId = rawId?.trim();
        if (!projectId) {
            return NextResponse.json({ message: "ID inválido" }, { status: 400 });
        }

        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ message: "Projeto não encontrado" }, { status: 404 });
        }

        if (!(await canManageProject(projectId, user.id, user.role))) {
            return NextResponse.json({ message: "Sem permissão para anexar arquivos" }, { status: 403 });
        }

        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ message: "Envie o arquivo como multipart/form-data" }, { status: 400 });
        }

        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ message: "Campo 'file' é obrigatório" }, { status: 422 });
        }

        const validationError = await validateUpload(file);
        if (validationError) {
            return NextResponse.json({ message: validationError.message }, { status: validationError.status });
        }

        const stored = await storeProjectFile({ projectId, file, uploadedById: user.id });

        return NextResponse.json(stored, { status: 201 });
    } catch (error) {
        console.error("[POST /api/projects/[id]/files]", error);
        return NextResponse.json({ message: "Erro ao anexar arquivo" }, { status: 500 });
    }
}
