import { prisma } from "@/src/infra/data/prisma";

import { ALLOWED_FILE_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./projects.schema";

export type FileValidationError = { message: string; status: number };

export async function validateUpload(file: File): Promise<FileValidationError | null> {
    if (file.size === 0) {
        return { message: "Arquivo vazio", status: 422 };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            message: `Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
            status: 413,
        };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileTypeFromBuffer } = await import("file-type");
    const detected = await fileTypeFromBuffer(buffer);

    const mimeType = detected?.mime ?? file.type;

    if (!ALLOWED_FILE_MIME_TYPES.includes(mimeType as never)) {
        return { message: `Tipo de arquivo não permitido: ${mimeType || "desconhecido"}`, status: 415 };
    }

    return null;
}

export async function storeProjectFile(params: { projectId: string; file: File; uploadedById: string }) {
    const { storage } = await import("@/src/lib/storage");

    const buffer = Buffer.from(await params.file.arrayBuffer());
    const mimeType = params.file.type || "application/octet-stream";

    const uploaded = await storage.uploadPrivate(buffer, `projects/${params.projectId}/${params.file.name}`, mimeType);

    return prisma.projectFile.create({
        data: {
            projectId: params.projectId,
            filename: params.file.name,
            url: uploaded.path,
            mimeType,
            sizeKb: Math.ceil(params.file.size / 1024),
            uploadedById: params.uploadedById,
        },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
    });
}

export async function getProjectFile(id: string) {
    return prisma.projectFile.findUnique({
        where: { id },
        include: { project: { select: { id: true, leaderId: true } } },
    });
}

export async function deleteProjectFile(id: string, storagePath: string) {
    const { storage } = await import("@/src/lib/storage");

    await prisma.projectFile.delete({ where: { id } });

    try {
        await storage.delete(storagePath, true);
    } catch (error) {
        console.error("[deleteProjectFile] falha ao remover do storage", { id, storagePath, error });
    }
}

export async function getFileDownloadUrl(storagePath: string): Promise<string> {
    const { storage } = await import("@/src/lib/storage");

    return storage.getPrivateUrl(storagePath, 300);
}
