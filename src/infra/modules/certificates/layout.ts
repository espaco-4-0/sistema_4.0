/**
 * Contrato do layout do certificado, compartilhado pelo editor visual e pelo
 * gerador de PDF. As coordenadas são em pontos, na página A4 paisagem, com
 * origem no canto inferior esquerdo (convenção do PDF).
 */
export const PAGE_WIDTH = 842;
export const PAGE_HEIGHT = 595;

export const ELEMENT_KEYS = ["titulo", "descricao", "nome", "curso", "rodape", "assinatura"] as const;

export type ElementKey = (typeof ELEMENT_KEYS)[number];

export type ElementStyle = {
    x: number;
    y: number;
    size: number;
    color: string;
    align: "left" | "center" | "right";
    visible: boolean;
};

export type CertificateLayoutV2 = {
    corFundo: string;
    corTitulo: string;
    corNome: string;
    corTexto: string;
    corBorda: string;
    showBorder: boolean;
    backgroundUrl?: string | null;
    logoUrl?: string | null;
    assinaturaUrl?: string | null;
    assinante?: string;
    cargo?: string;
    elements: Record<ElementKey, ElementStyle>;
};

export const ELEMENT_LABELS: Record<ElementKey, string> = {
    titulo: "Título",
    descricao: "Descrição",
    nome: "Nome do aluno",
    curso: "Curso",
    rodape: "Rodapé (data e validade)",
    assinatura: "Assinatura",
};

/** Posições padrão, equivalentes ao layout fixo que existia antes. */
export const DEFAULT_LAYOUT: CertificateLayoutV2 = {
    corFundo: "#FFFDF0",
    corTitulo: "#1A1A1A",
    corNome: "#B89614",
    corTexto: "#4A4A4A",
    corBorda: "#B89614",
    showBorder: true,
    backgroundUrl: null,
    logoUrl: null,
    assinaturaUrl: null,
    elements: {
        titulo: { x: 421, y: 515, size: 28, color: "#1A1A1A", align: "center", visible: true },
        descricao: { x: 421, y: 470, size: 12, color: "#4A4A4A", align: "center", visible: true },
        nome: { x: 421, y: 400, size: 32, color: "#B89614", align: "center", visible: true },
        curso: { x: 421, y: 330, size: 16, color: "#4A4A4A", align: "center", visible: true },
        rodape: { x: 421, y: 120, size: 11, color: "#4A4A4A", align: "center", visible: true },
        assinatura: { x: 421, y: 70, size: 12, color: "#4A4A4A", align: "center", visible: true },
    },
};

/**
 * Aceita tanto o formato antigo (só cores) quanto o novo, para não quebrar
 * templates já salvos no banco.
 */
export function normalizeLayout(raw: unknown): CertificateLayoutV2 {
    const layout = (raw ?? {}) as Partial<CertificateLayoutV2> & Record<string, unknown>;

    const elements = {} as Record<ElementKey, ElementStyle>;
    const salvos = (layout.elements ?? {}) as Partial<Record<ElementKey, Partial<ElementStyle>>>;

    ELEMENT_KEYS.forEach((key) => {
        elements[key] = { ...DEFAULT_LAYOUT.elements[key], ...(salvos[key] ?? {}) };
    });

    return {
        corFundo: layout.corFundo ?? DEFAULT_LAYOUT.corFundo,
        corTitulo: layout.corTitulo ?? DEFAULT_LAYOUT.corTitulo,
        corNome: layout.corNome ?? DEFAULT_LAYOUT.corNome,
        corTexto: layout.corTexto ?? DEFAULT_LAYOUT.corTexto,
        corBorda: layout.corBorda ?? DEFAULT_LAYOUT.corBorda,
        showBorder: layout.showBorder ?? DEFAULT_LAYOUT.showBorder,
        backgroundUrl: layout.backgroundUrl ?? null,
        logoUrl: layout.logoUrl ?? null,
        assinaturaUrl: layout.assinaturaUrl ?? null,
        assinante: layout.assinante,
        cargo: layout.cargo,
        elements,
    };
}
