import { getGalleryItems } from "@/src/infra/modules/gallery/gallery.service";
import { GetGalleryItemsParams } from "@/src/infra/modules/gallery/gallery.types";
import { useQuery } from "@tanstack/react-query";

export const landingGalleryKeys = {
    all: ["landing-gallery"] as const,
    list: (filters?: GetGalleryItemsParams) => [...landingGalleryKeys.all, "list", filters] as const,
};

export function useLandingGallery(params?: GetGalleryItemsParams) {
    return useQuery({
        queryKey: landingGalleryKeys.list(params),
        queryFn: () => getGalleryItems(params || {}),
        staleTime: 10 * 60 * 1000,
    });
}
