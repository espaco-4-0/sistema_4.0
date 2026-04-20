export type BlogPost = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    conteudo: string;
    tempoDeLeitura: number;
    publicado: boolean;
    createdAt: string;
    updatedAt: string;
    capaImagemId: string | null;
    autorId: string;
    fotos: { url: string }[];
    categorias: { nome: string }[];
    autor: { nomeCompleto: string };
};

export type BlogListResponse = {
    data: BlogPost[];
};
