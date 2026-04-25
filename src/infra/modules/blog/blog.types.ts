export type BlogComment = {
    id: string;
    conteudo: string;
    createdAt: Date;
    autor: {
        id: string;
        nomeCompleto: string;
    };
};

export type BlogPost = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    conteudo: string;
    tempoDeLeitura: number;
    publicado: boolean;
    createdAt: Date;
    updatedAt: Date;
    autorId: string;
    foto?: { url: string } | null;
    categoria?: { nome: string } | null;
    autor: { nomeCompleto: string };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
};

export type BlogCommentsResponse = {
    data: BlogComment[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type BlogListResponse = {
    data: BlogPost[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type BlogCard = {
    id: string;
    slug: string;
    category: string;
    title: string;
    image: string;
    excerpt: string;
    author: string;
    readingTime: number;
    createdAt: Date;
};
