import api from "@/lib/axios";

import type { BlogCard, BlogCommentsResponse, BlogPost } from "./blog.types";

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
    published?: boolean;
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
            published: params.published,
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

export async function getPostComments(slug: string, page: number): Promise<BlogCommentsResponse> {
    const { data } = await api.get<BlogCommentsResponse>(`/api/blog/${encodeURIComponent(slug)}/comentario`, {
        params: { page },
    });
    return data;
}

export function normalizePostToCard(post: BlogPost): BlogCard {
    return {
        id: String(post.id),
        slug: post.slug,
        category: post.categoria?.nome?.trim() || "Geral",
        title: post.titulo?.trim() || "Notícia sem título",
        image: post.foto?.url?.trim() || FALLBACK_IMAGE,
        excerpt: post.resumo?.trim() || post.conteudo?.slice(0, 140) || "Leia a notícia completa para mais detalhes.",
        author: post.autor.nomeCompleto || "Espaço 4.0",
        readingTime: post.tempoDeLeitura || 5,
        createdAt: post.createdAt,
    };
}

export async function getCategories(includeAll = false) {
    const { data } = await api.get("/api/blog/categoria", {
        params: { includeAll }
    });
    return data.data ?? [];
}

export async function createCategory(name: string): Promise<void> {
    await api.post("/api/blog/categoria", { name });
}

export async function updateCategory(id: string, name: string): Promise<void> {
    await api.patch(`/api/blog/categoria/${id}`, { name });
}

export async function deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/blog/categoria/${id}`);
}

export async function toggleLike(postId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
        await api.delete(`/api/blog/curtida/${postId}`);
    } else {
        await api.post("/api/blog/curtida", { postId });
    }
}

export async function postComment(postId: string, comment: string): Promise<void> {
    await api.post("/api/blog/comentario", { postId, comment });
}

export async function deleteComment(commentId: string): Promise<void> {
    await api.delete(`/api/blog/comentario/${commentId}`);
}

export async function updatePostStatus(slug: string, published: boolean): Promise<void> {
    await api.patch(`/api/blog/${encodeURIComponent(slug)}`, { published });
}

export async function deletePost(slug: string): Promise<void> {
    await api.delete(`/api/blog/${encodeURIComponent(slug)}`);
}

export async function createPost(data: FormData): Promise<void> {
    await api.post("/api/blog", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export async function updatePost(slug: string, data: FormData): Promise<void> {
    await api.put(`/api/blog/${encodeURIComponent(slug)}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}
