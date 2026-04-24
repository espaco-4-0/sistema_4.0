import { GetPostsParams, getCategories, getPostBySlug, getPosts } from "@/src/infra/modules/blog/blog.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
