import {
    createGalleryItem,
    deleteGalleryItem,
    getGalleryItems,
    updateGalleryItem,
} from "@/src/infra/modules/gallery/gallery.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { GetGalleryItemsParams } from "@/src/infra/modules/gallery/gallery.types";

export const galleryKeys = {
    all: ["gallery"] as const,
    list: (filters?: GetGalleryItemsParams) => [...galleryKeys.all, "list", filters] as const,
};

export function useGallery(params?: GetGalleryItemsParams) {
    return useQuery({
        queryKey: galleryKeys.list(params),
        queryFn: () => getGalleryItems(params || {}),
        staleTime: 5 * 60 * 1000,
    });
}

export function useToggleGalleryStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive, title }: { id: string; isActive: boolean; title: string }) =>
            updateGalleryItem(id, { isActive, title }),
        onMutate: async (newItem) => {
            await queryClient.cancelQueries({ queryKey: galleryKeys.all });

            const previousQueries = queryClient.getQueriesData({ queryKey: galleryKeys.all });

            queryClient.setQueriesData({ queryKey: galleryKeys.all }, (old: any) => {
                if (!old || !old.data || !Array.isArray(old.data)) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.id === newItem.id ? { ...item, isActive: newItem.isActive, title: newItem.title } : item
                    ),
                };
            });

            return { previousQueries };
        },
        onError: (err: any, _, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData);
                });
            }
            toast.error(err.response?.data?.error || "Erro ao atualizar item da galeria.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
        },
        onSuccess: () => {
            toast.success("Item da galeria atualizado!");
        },
    });
}

export function useUploadToGallery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormData) => createGalleryItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            toast.success("Imagem enviada com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao enviar imagem.");
        },
    });
}

export function useDeleteGalleryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteGalleryItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            toast.success("Imagem excluída com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao excluir imagem.");
        },
    });
}
