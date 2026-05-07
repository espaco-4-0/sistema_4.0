import api from "@/lib/axios";

import { GalleryListResponse } from "./gallery.types";

export async function getGalleryItems(name: string, page: number, onlyActive?: true): Promise<GalleryListResponse> {
    const { data } = await api.get("/api/gallery", { params: { onlyActive, name, page } });
    return data.data ?? [];
}

export async function createGalleryItem(title: string, url: string, isActive: boolean): Promise<void> {
    await api.post("/api/gallery", { title, url, isActive });
}

export async function editGalleryItem(id: string, title: string, isActive: boolean): Promise<void> {
    await api.patch(`/api/gallery/${id}`, { params: { title, isActive } });
}

export async function deleteGalleryItem(id: string): Promise<void> {
    await api.delete(`/api/gallery/${id}`);
}

export async function getImageFromPost(postId: string, title: string): Promise<void> {
    await api.post(`/api/gallery/from-post/`, { params: { postId, title } });
}
