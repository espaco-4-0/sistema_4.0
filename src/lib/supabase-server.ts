import { SupabaseClient, createClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

// Init preguiçoso: criar o client no topo do módulo quebra `next build`, porque o
// Next avalia o módulo ao coletar as rotas e as credenciais não existem no build.
export function supabaseAdmin(): SupabaseClient {
    if (cachedClient) return cachedClient;

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos.");
    }

    cachedClient = createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return cachedClient;
}

export const VISIT_DOCS_BUCKET = "visit-documents";

export async function uploadVisitDocument(visitId: number, file: File): Promise<string> {
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `visitas/${visitId}/${timestamp}-${sanitized}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[supabase] uploading ${storagePath} (${buffer.byteLength} bytes) to bucket ${VISIT_DOCS_BUCKET}`);

    // `duplex` não está no tipo FileOptions do supabase-js, mas é repassado ao fetch.
    const uploadOptions = {
        contentType: file.type || "application/octet-stream",
        duplex: "half",
        upsert: false,
    } satisfies Record<string, unknown>;

    const { data, error } = await supabaseAdmin()
        .storage.from(VISIT_DOCS_BUCKET)
        .upload(storagePath, buffer, uploadOptions);

    if (error) {
        console.error(`[supabase] upload error:`, error);
        throw new Error(`Falha ao enviar arquivo: ${error.message}`);
    }

    console.log(`[supabase] upload ok:`, data);
    return storagePath;
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabaseAdmin()
        .storage.from(VISIT_DOCS_BUCKET)
        .createSignedUrl(storagePath, 60 * 60); // 1 hora

    if (error || !data?.signedUrl) {
        throw new Error(`Falha ao gerar URL de download: ${error?.message ?? "URL vazia"}`);
    }

    return data.signedUrl;
}

export async function deleteVisitDocument(storagePath: string): Promise<void> {
    await supabaseAdmin().storage.from(VISIT_DOCS_BUCKET).remove([storagePath]);
}
