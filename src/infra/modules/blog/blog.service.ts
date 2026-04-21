import api from "@/lib/axios";

import type { BlogCard, BlogPost } from "./blog.types";

const FALLBACK_IMAGE = "fallback-image.png";

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
