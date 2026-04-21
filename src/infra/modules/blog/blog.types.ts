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
};

export type BlogListResponse = {
    data: BlogPost[];
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
