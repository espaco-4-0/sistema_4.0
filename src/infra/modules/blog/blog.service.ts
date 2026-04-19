import api from "@/lib/axios";

import type { BlogPost } from "./blog.types";

type BlogListResponse = {
    data: BlogPost[];
};

type BlogBySlugResponse = {
    data: BlogPost;
};

export type GetPostsParams = {
    quantity?: number;
    category?: string;
    name?: string;
    includeArchived?: boolean;
};

export async function getPosts(params: GetPostsParams = {}): Promise<BlogPost[]> {
    const { data } = await api.get<BlogListResponse>("/api/blog", {
        params: {
            quantity: params.quantity,
            category: params.category,
            name: params.name,
            includeArchived: params.includeArchived,
        },
    });

    return data.data;
}

export async function getTopPosts(): Promise<BlogPost[]> {
    return getPosts({ quantity: 5, includeArchived: false });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!slug?.trim()) return null;

    try {
        const { data } = await api.get<BlogBySlugResponse>(`/api/blog/slug/${encodeURIComponent(slug)}`);
        return data.data;
    } catch {
        return null;
    }
}
