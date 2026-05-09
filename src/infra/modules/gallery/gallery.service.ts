import api from "@/lib/axios";
import { GalleryItem } from "@/src/generated/prisma/client";

import { GalleryListResponse, GetGalleryItemsParams, UpdateGalleryItemParams } from "./gallery.types";

export async function getGalleryItems(params: GetGalleryItemsParams): Promise<GalleryListResponse> {
    const { data } = await api.get("/api/gallery", { params });
    return data;
}

export async function createGalleryItem(formData: FormData): Promise<GalleryItem> {
    const { data } = await api.post("/api/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export async function updateGalleryItem(id: string, data: UpdateGalleryItemParams): Promise<GalleryItem> {
    const { data: responseData } = await api.patch(`/api/gallery/${id}`, data);
    return responseData.data;
}

export async function deleteGalleryItem(id: string): Promise<void> {
    await api.delete(`/api/gallery/${id}`);
}
