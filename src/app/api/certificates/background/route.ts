import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { storage } from "@/src/lib/storage";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

/** Upload da imagem de fundo usada no editor de template. */
export async function POST(req: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ message: "Envie os dados como multipart/form-data" }, { status: 400 });
        }

        const file = formData.get("file");

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ message: "Nenhum arquivo enviado" }, { status: 400 });
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json({ message: "A imagem deve ter no máximo 5MB" }, { status: 400 });
        }

        if (!ALLOWED_MIME.includes(file.type)) {
            return NextResponse.json({ message: "Formato inválido. Use PNG, JPEG ou WebP." }, { status: 400 });
        }

        const uploaded = await storage.uploadPublic(file, `certificados/fundos/${user.id}-${file.name}`, file.type);

        return NextResponse.json({ url: uploaded.url ?? uploaded.path }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/certificates/background]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
