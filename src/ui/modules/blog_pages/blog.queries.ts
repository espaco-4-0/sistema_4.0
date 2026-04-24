import {
    GetPostsParams,
    getCategories,
    getPostBySlug,
    getPosts,
    toggleLike,
} from "@/src/infra/modules/blog/blog.service";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const blogKeys = {
    all: ["posts"] as const,
    list: (filters?: object) => [...blogKeys.all, "list", filters] as const,
    detail: (slug: string) => [...blogKeys.all, "detail", slug] as const,
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

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
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
        onError: (variables, context) => {
            if (context?.previousPost) {
                queryClient.setQueryData(blogKeys.detail(variables.slug), context.previousPost);
            }
            toast.error("Erro ao processar curtida. Tente novamente.");
        },
        onSettled: (variables) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.slug) });
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
        },
    });
}
