import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export const VISIT_DOCS_BUCKET = "visit-documents";

export async function uploadVisitDocument(visitId: number, file: File): Promise<string> {
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `visitas/${visitId}/${timestamp}-${sanitized}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[supabase] uploading ${storagePath} (${buffer.byteLength} bytes) to bucket ${VISIT_DOCS_BUCKET}`);
    console.log(`[supabase] URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

    const { data, error } = await supabaseAdmin.storage.from(VISIT_DOCS_BUCKET).upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        duplex: "half",
        upsert: false,
    } as any);

    if (error) {
        console.error(`[supabase] upload error:`, error);
        throw new Error(`Falha ao enviar arquivo: ${error.message}`);
    }

    console.log(`[supabase] upload ok:`, data);
    return storagePath;
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabaseAdmin.storage.from(VISIT_DOCS_BUCKET).createSignedUrl(storagePath, 60 * 60); // 1 hora

    if (error || !data?.signedUrl) {
        throw new Error(`Falha ao gerar URL de download: ${error?.message ?? "URL vazia"}`);
    }

    return data.signedUrl;
}

export async function deleteVisitDocument(storagePath: string): Promise<void> {
    await supabaseAdmin.storage.from(VISIT_DOCS_BUCKET).remove([storagePath]);
}
