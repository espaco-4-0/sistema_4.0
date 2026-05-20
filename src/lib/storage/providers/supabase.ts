import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { StorageProvider, UploadResult } from "../types";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL and Service Role Key must be set in environment variables.");
}

const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const PUBLIC_BUCKET = "public-uploads";
const PRIVATE_BUCKET = "private-uploads";

function sanitizeFileName(name: string) {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.\-_]/g, "")
        .replace(/--+/g, "-");
}

async function upload(file: File | Buffer, filePath: string, bucket: string, mimeType?: string): Promise<UploadResult> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    const parts = filePath.split("/");
    const fileName = parts.pop()!; // último segmento = nome
    const folder = parts.join("/"); // o resto = pasta

    const sanitized = sanitizeFileName(fileName);
    const uniqueName = folder
        ? `${folder}/${randomUUID()}-${sanitized}` // mantém a pasta intacta
        : `${randomUUID()}-${sanitized}`;

    const { data, error } = await client.storage.from(bucket).upload(uniqueName, buffer, {
        contentType: mimeType ?? "application/octet-stream",
        upsert: false,
    });

    if (error) throw new Error(error.message);
    return { path: data.path };
}

export const supabaseStorage: StorageProvider = {
    async uploadPublic(file, fileName, mimeType) {
        const result = await upload(file, fileName, PUBLIC_BUCKET, mimeType);
        const { data } = client.storage.from(PUBLIC_BUCKET).getPublicUrl(result.path);
        return { path: result.path, url: data.publicUrl };
    },
    async uploadPrivate(file, fileName, mimeType) {
        return await upload(file, fileName, PRIVATE_BUCKET, mimeType);
    },
    async getPrivateUrl(rawPath, expiresInSeconds = 3600) {
        let path = rawPath;
        if (rawPath.startsWith("http")) {
            const marker = `${PRIVATE_BUCKET}/`;
            const idx = rawPath.indexOf(marker);
            if (idx !== -1) {
                path = rawPath.slice(idx + marker.length);
            }
        }

        const { data, error } = await client.storage.from(PRIVATE_BUCKET).createSignedUrl(path, expiresInSeconds);
        if (error) throw new Error(error.message);
        return data.signedUrl;
    },
    async delete(rawPath, isPrivate = false) {
        const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
        let path = rawPath;
        if (rawPath.startsWith("http")) {
            const marker = `${bucket}/`;
            const idx = rawPath.indexOf(marker);
            if (idx !== -1) {
                path = rawPath.slice(idx + marker.length);
            }
        }

        const { error } = await client.storage.from(bucket).remove([path]);
        if (error) throw new Error(error.message);
    },
    async changeVisibility(rawPath: string, toPublic: boolean) {
        const fromBucket = toPublic ? PRIVATE_BUCKET : PUBLIC_BUCKET;
        const toBucket = toPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET;

        let path = rawPath;
        if (rawPath.startsWith("http")) {
            const fromMarker = `${fromBucket}/`;
            const toMarker = `${toBucket}/`;

            const fromIdx = rawPath.indexOf(fromMarker);
            const toIdx = rawPath.indexOf(toMarker);

            if (fromIdx !== -1) {
                path = rawPath.slice(fromIdx + fromMarker.length);
            } else if (toIdx !== -1) {
                const targetPath = rawPath.slice(toIdx + toMarker.length);
                const url = toPublic ? client.storage.from(toBucket).getPublicUrl(targetPath).data.publicUrl : null;
                return { path: targetPath, ...(url && { url }) };
            } else {
                throw new Error(
                    `URL não pertence a nenhum dos buckets conhecidos (${fromBucket} ou ${toBucket}): ${rawPath}`
                );
            }
        }

        const { data: fileData, error: downloadError } = await client.storage.from(fromBucket).download(path);

        if (!fileData || downloadError) {
            const { data: checkData } = await client.storage.from(toBucket).list("", {
                search: path,
            });

            if (checkData && checkData.length > 0) {
                const url = toPublic ? client.storage.from(toBucket).getPublicUrl(path).data.publicUrl : null;
                return { path, ...(url && { url }) };
            }

            throw new Error(`Falha ao baixar imagem (bucket: ${fromBucket}, path: ${path}): ${downloadError?.message}`);
        }

        const { error: uploadError } = await client.storage
            .from(toBucket)
            .upload(path, fileData, { upsert: true, contentType: fileData.type });

        if (uploadError) {
            throw new Error(`Falha ao subir imagem: ${uploadError.message}`);
        }

        await client.storage.from(fromBucket).remove([path]);

        const url = toPublic ? client.storage.from(toBucket).getPublicUrl(path).data.publicUrl : null;

        return { path, ...(url && { url }) };
    },
};
