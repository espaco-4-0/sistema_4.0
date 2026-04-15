import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { StorageProvider, UploadResult } from "../types";

console.log(process.env.SUPABASE_URL, "ASDASD", process.env.SUPABASE_SERVICE_ROLE_KEY);
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

async function upload(file: File | Buffer, fileName: string, bucket: string, mimeType?: string): Promise<UploadResult> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
    const sanitized = sanitizeFileName(fileName);
    const uniqueName = `${randomUUID()}-${sanitized}`;

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
        return { ...result, url: data.publicUrl };
    },
    async uploadPrivate(file, fileName, mimeType) {
        return await upload(file, fileName, PRIVATE_BUCKET, mimeType);
    },
    async getPrivateUrl(path, expiresInSeconds = 3600) {
        const { data, error } = await client.storage.from(PRIVATE_BUCKET).createSignedUrl(path, expiresInSeconds);
        if (error) throw new Error(error.message);
        return data.signedUrl;
    },
    async delete(path, isPrivate = false) {
        const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
        const { error } = await client.storage.from(bucket).remove([path]);
        if (error) throw new Error(error.message);
    },
};
