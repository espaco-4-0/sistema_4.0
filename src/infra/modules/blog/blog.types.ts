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
    capaImagemId: string | null;
    autorId: string;
    fotos: { url: string }[];
    categorias: { nome: string }[];
    autor: { nomeCompleto: string };
    likesCount: number;
    isLiked: boolean;
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
