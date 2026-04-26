import {
    createPost,
    deletePost,
    getCategories,
    getPosts,
    updatePost,
    updatePostStatus,
} from "@/src/infra/modules/blog/blog.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const newsKeys = {
    all: ["teacher-news"] as const,
    list: (filters?: object) => [...newsKeys.all, "list", filters] as const,
    categories: (includeAll: boolean) => [...newsKeys.all, "categories", includeAll] as const,
};

export function useCategories(includeAll = false) {
    return useQuery({
        queryKey: newsKeys.categories(includeAll),
        queryFn: () => getCategories(includeAll),
    });
}

export function useNewsList(
    params: { page?: number; limit?: number; includeArchived?: boolean; name?: string; published?: boolean } = {}
) {
    return useQuery({
        queryKey: newsKeys.list(params),
        queryFn: () => getPosts(params),
    });
}

export function useApprovePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slug: string) => updatePostStatus(slug, true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Notícia publicada com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao publicar notícia.");
        },
    });
}

export function useUnpublishPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slug: string) => updatePostStatus(slug, false),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Notícia suspensa com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao suspender notícia.");
        },
    });
}

export function useRejectPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slug: string) => deletePost(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            toast.success("Solicitação recusada.");
        },
        onError: () => {
            toast.error("Erro ao recusar solicitação.");
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slug: string) => deletePost(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post excluído com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir post.");
        },
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormData) => createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post criado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao criar post.");
        },
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ slug, data }: { slug: string; data: FormData }) => updatePost(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post atualizado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao atualizar post.");
        },
    });
}
