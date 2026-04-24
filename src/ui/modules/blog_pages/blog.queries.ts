import { getPostBySlug, getPosts } from "@/src/infra/modules/blog/blog.service";
import { useQuery } from "@tanstack/react-query";

export const blogKeys = {
    all: ["posts"] as const,
    list: (filters?: object) => [...blogKeys.all, "list", filters] as const,
    detail: (slug: string) => [...blogKeys.all, "detail", slug] as const,
};

export function usePosts(filters?: { quantity?: number; includeArchived?: boolean }) {
    return useQuery({
        queryKey: blogKeys.list(filters),
        queryFn: () => getPosts(filters ?? {}),
    });
}

export function usePostBySlug(slug: string) {
    return useQuery({
        queryKey: blogKeys.detail(slug),
        queryFn: () => getPostBySlug(slug),
        enabled: !!slug?.trim(),
    });
}
