import api from "@/lib/axios";

import type { BlogCard, BlogPost } from "./blog.types";

const FALLBACK_IMAGE = "fallback-image.png";

type BlogListResponse = {
    data: BlogPost[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

type BlogBySlugResponse = {
    data: BlogPost;
};

export type GetPostsParams = {
    quantity?: number;
    page?: number;
    limit?: number;
    category?: string;
    name?: string;
    includeArchived?: boolean;
};

export async function getPosts(params: GetPostsParams = {}): Promise<BlogListResponse> {
    const { data } = await api.get<BlogListResponse>("/api/blog", {
        params: {
            quantity: params.quantity,
            page: params.page,
            limit: params.limit,
            category: params.category,
            name: params.name,
            includeArchived: params.includeArchived,
        },
    });

    return data;
}

export async function getTopPosts(): Promise<BlogPost[]> {
    const res = await getPosts({ quantity: 5, includeArchived: false });

    return res.data;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!slug?.trim()) return null;

    try {
        const { data } = await api.get<BlogBySlugResponse>(`/api/blog/${encodeURIComponent(slug)}`);
        return data.data;
    } catch {
        return null;
    }
}

export function normalizePostToCard(post: BlogPost): BlogCard {
    return {
        id: String(post.id),
        slug: post.slug,
        category: post.categorias?.[0]?.nome?.trim() || "Geral",
        title: post.titulo?.trim() || "Notícia sem título",
        image: post.fotos?.[0]?.url?.trim() || FALLBACK_IMAGE,
        excerpt: post.resumo?.trim() || post.conteudo?.slice(0, 140) || "Leia a notícia completa para mais detalhes.",
        author: post.autor.nomeCompleto || "Espaço 4.0",
        readingTime: post.tempoDeLeitura || 5,
        createdAt: post.createdAt,
    };
}

export async function getCategories() {
    const res = await fetch("/api/blog/categoria");

    if (!res.ok) {
        throw new Error("Erro ao buscar categorias");
    }

    const json = await res.json();
    return json.data ?? [];
}

export async function toggleLike(postId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
        await api.delete(`/api/blog/curtida/${postId}`);
    } else {
        await api.post("/api/blog/curtida", { postId });
    }
}
