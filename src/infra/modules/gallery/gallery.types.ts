import { GalleryItem } from "@/src/generated/prisma/client";

export type GalleryListResponse = {
    data: GalleryItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type GetGalleryItemsParams = {
    isActive?: boolean;
    wordFilter?: string;
    page?: number;
    limit?: number;
};

export type UpdateGalleryItemParams = {
    isActive: boolean;
    title: string;
};
