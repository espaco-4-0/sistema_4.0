import { PAGE_HEIGHT, PAGE_WIDTH, normalizeLayout, type ElementStyle } from "@/src/infra/modules/certificates/layout";
import { PDF, rgb } from "@libpdf/core";

interface CertificateData {
    titulo: string;
    descricao: string;
    alunoNome: string;
    curso: string;
    cargaHoraria?: number;
    validadeAte?: Date;
    emitidoEm: Date;
    layout: unknown;
}

const MARGIN = 28;

/** Busca a imagem de fundo. Falha aqui não pode impedir a emissão. */
async function fetchImage(url: string | null | undefined): Promise<Uint8Array | null> {
    if (!url) return null;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return new Uint8Array(await response.arrayBuffer());
    } catch {
        console.warn(`[pdf] não foi possível carregar a imagem de fundo: ${url}`);
        return null;
    }
}

export async function generatePdf(data: CertificateData): Promise<Buffer> {
    const layout = normalizeLayout(data.layout);

    const pdf = PDF.create();
    pdf.setTitle(data.titulo);
    pdf.setAuthor("Sistema de Certificados");
    pdf.setCreator("CertificadosApp");

    const page = pdf.addPage({ size: "a4", orientation: "landscape" });

    page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: hexToRgb(layout.corFundo),
    });

    // A imagem de fundo cobre a página inteira, por cima da cor sólida.
    const background = await fetchImage(layout.backgroundUrl);
    if (background) {
        try {
            const image = await pdf.embedImage(background);
            page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
        } catch {
            console.warn("[pdf] imagem de fundo inválida, seguindo com a cor sólida");
        }
    }

    if (layout.showBorder) {
        page.drawRectangle({
            x: MARGIN,
            y: MARGIN,
            width: PAGE_WIDTH - MARGIN * 2,
            height: PAGE_HEIGHT - MARGIN * 2,
            borderColor: hexToRgb(layout.corBorda),
            borderWidth: 3,
        });
    }

    /** Posiciona o texto respeitando o alinhamento escolhido no editor. */
    const drawAt = (text: string, style: ElementStyle, maxWidth?: number) => {
        if (!style.visible || !text) return;

        const width = estimateTextWidth(text, style.size);
        let x = style.x;

        if (style.align === "center") x = style.x - width / 2;
        else if (style.align === "right") x = style.x - width;

        page.drawText(text, {
            x,
            y: style.y,
            size: style.size,
            color: hexToRgb(style.color),
            ...(maxWidth ? { maxWidth, lineHeight: 1.5 } : {}),
        });
    };

    drawAt(data.titulo, layout.elements.titulo);
    drawAt(data.descricao, layout.elements.descricao, 440);
    drawAt(data.alunoNome, layout.elements.nome);

    const cursoTexto = data.cargaHoraria ? `${data.curso} — ${data.cargaHoraria} horas` : data.curso;
    drawAt(cursoTexto, layout.elements.curso);

    const emitidoEm = data.emitidoEm.toLocaleDateString("pt-BR");
    const rodape = data.validadeAte
        ? `Emitido em ${emitidoEm} · Válido até ${data.validadeAte.toLocaleDateString("pt-BR")}`
        : `Emitido em ${emitidoEm}`;
    drawAt(rodape, layout.elements.rodape);

    const assinaturaStyle = layout.elements.assinatura;
    if (assinaturaStyle.visible) {
        const signature = await fetchImage(layout.assinaturaUrl);

        if (signature) {
            try {
                const image = await pdf.embedImage(signature);
                page.drawImage(image, {
                    x: assinaturaStyle.x - 60,
                    y: assinaturaStyle.y + 8,
                    width: 120,
                    height: 40,
                });
            } catch {
                console.warn("[pdf] imagem de assinatura inválida");
            }
        }

        page.drawLine({
            start: { x: assinaturaStyle.x - 100, y: assinaturaStyle.y },
            end: { x: assinaturaStyle.x + 100, y: assinaturaStyle.y },
            color: hexToRgb(assinaturaStyle.color),
            thickness: 0.5,
        });

        const legenda = layout.assinante
            ? `${layout.assinante}${layout.cargo ? ` — ${layout.cargo}` : ""}`
            : "Assinatura do Responsável";

        drawAt(legenda, { ...assinaturaStyle, y: assinaturaStyle.y - 14, size: 9 });
    }

    const uint8Array = await pdf.save();
    return Buffer.from(uint8Array);
}

function estimateTextWidth(text: string, fontSize: number): number {
    return text.length * fontSize * 0.5;
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
}
