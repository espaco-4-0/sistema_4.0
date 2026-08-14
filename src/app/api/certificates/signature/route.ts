import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { createSignatureSchema } from "@/src/infra/modules/certificates/certifcates.schema";
import { getSignature, saveSignature } from "@/src/infra/modules/certificates/issuances.service";
import { storage } from "@/src/lib/storage";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIGNATURE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

export async function GET() {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const roleError = requireRole(user.role, "admin", "professor");
        if (roleError) return roleError;

        const signature = await getSignature(user.id);

        if (!signature) {
            return NextResponse.json({ message: "Assinatura não configurada" }, { status: 404 });
        }

        return NextResponse.json(signature, { status: 200 });
    } catch (err) {
        console.error("[GET /api/certificates/signature]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}

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

        const parsed = createSignatureSchema.safeParse({
            responsibleName: formData.get("responsibleName"),
            role: formData.get("role"),
        });

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const file = formData.get("file");
        const existing = await getSignature(user.id);

        // Na atualização a imagem é opcional: mantém a que já está salva.
        if (!(file instanceof File) || file.size === 0) {
            if (!existing) {
                return NextResponse.json({ message: "A imagem da assinatura é obrigatória" }, { status: 400 });
            }

            const updated = await saveSignature(user.id, parsed.data, existing.signatureImageUrl);
            return NextResponse.json(updated, { status: 200 });
        }

        if (file.size > MAX_SIGNATURE_BYTES) {
            return NextResponse.json({ message: "A imagem deve ter no máximo 2MB" }, { status: 400 });
        }

        if (!ALLOWED_MIME.includes(file.type)) {
            return NextResponse.json({ message: "Formato inválido. Use PNG, JPEG ou WebP." }, { status: 400 });
        }

        const uploaded = await storage.uploadPublic(file, `assinaturas/${user.id}-${file.name}`, file.type);
        const saved = await saveSignature(user.id, parsed.data, uploaded.url ?? uploaded.path);

        return NextResponse.json(saved, { status: existing ? 200 : 201 });
    } catch (err) {
        console.error("[POST /api/certificates/signature]", err);
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}
