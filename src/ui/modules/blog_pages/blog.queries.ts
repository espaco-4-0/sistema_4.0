import {
    GetPostsParams,
    deleteComment,
    getCategories,
    getPostBySlug,
    getPostComments,
    getPosts,
    postComment,
    toggleLike,
} from "@/src/infra/modules/blog/blog.service";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const blogKeys = {
    all: ["posts"] as const,
    list: (filters?: object) => [...blogKeys.all, "list", filters] as const,
    detail: (slug: string) => [...blogKeys.all, "detail", slug] as const,
    comments: (slug: string, page: number) => [...blogKeys.detail(slug), "comments", page] as const,
};

export function usePosts(filters?: GetPostsParams) {
    return useQuery({
        queryKey: blogKeys.list(filters),
        queryFn: () => getPosts(filters ?? {}),
        placeholderData: keepPreviousData,
    });
}

export function usePostBySlug(slug: string) {
    return useQuery({
        queryKey: blogKeys.detail(slug),
        queryFn: () => getPostBySlug(slug),
        enabled: !!slug?.trim(),
    });
}

export function usePostComments(slug: string, page: number) {
    return useQuery({
        queryKey: blogKeys.comments(slug, page),
        queryFn: () => getPostComments(slug, page),
        enabled: !!slug?.trim(),
        placeholderData: keepPreviousData,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
    });
}

export function useToggleLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean; slug: string }) =>
            toggleLike(postId, isLiked),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: blogKeys.detail(variables.slug) });

            const previousPost = queryClient.getQueryData<BlogPost>(blogKeys.detail(variables.slug));

            if (previousPost) {
                queryClient.setQueryData<BlogPost>(blogKeys.detail(variables.slug), {
                    ...previousPost,
                    isLiked: !variables.isLiked,
                    likesCount: variables.isLiked ? previousPost.likesCount - 1 : previousPost.likesCount + 1,
                });
            }

            return { previousPost };
        },
        onError: (_error, variables, context) => {
            if (context?.previousPost) {
                queryClient.setQueryData(blogKeys.detail(variables.slug), context.previousPost);
            }
            toast.error("Erro ao processar curtida. Tente novamente.");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.slug) });
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
        },
    });
}

export function usePostComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, comment }: { postId: string; comment: string; slug: string }) =>
            postComment(postId, comment),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.slug) });
            queryClient.invalidateQueries({ queryKey: [...blogKeys.detail(variables.slug), "comments"] });
            toast.success("Comentário postado com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao postar comentário. Tente novamente.");
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId }: { commentId: string; slug: string }) => deleteComment(commentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.slug) });
            queryClient.invalidateQueries({ queryKey: [...blogKeys.detail(variables.slug), "comments"] });
            toast.success("Comentário excluído com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir comentário. Tente novamente.");
        },
    });
}
