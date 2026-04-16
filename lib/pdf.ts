import { PDF, rgb } from "@libpdf/core";

interface CertificateData {
  titulo: string;
  descricao: string;
  alunoNome: string;
  curso: string;
  cargaHoraria?: number;
  validadeAte?: Date;
  emitidoEm: Date;
  layout: {
    corFundo: string;
    corTitulo: string;
    corNome: string;
    corTexto: string;
    corBorda: string;
    assinante?: string;
    cargo?: string;
    logoUrl?: string;
    assinaturaUrl?: string;
  };
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 28;

export async function generatePdf(data: CertificateData): Promise<Buffer> {
    const pdf = PDF.create();

    pdf.setTitle(data.titulo);
    pdf.setAuthor("Sistema de Certificados");
    pdf.setCreator("CertificadosApp");

    const page = pdf.addPage({
        size: "a4",
        orientation: "landscape",
    });

    page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: hexToRgb(data.layout.corFundo),
    });

    page.drawRectangle({
        x: MARGIN,
        y: MARGIN,
        width: PAGE_WIDTH - MARGIN * 2,
        height: PAGE_HEIGHT - MARGIN * 2,
        borderColor: hexToRgb(data.layout.corBorda),
        borderWidth: 3,
    });

    page.drawText(data.titulo, {
        x: PAGE_WIDTH / 2 - estimateTextWidth(data.titulo, 28) / 2,
        y: PAGE_HEIGHT - 80,
        size: 28,
        color: hexToRgb(data.layout.corTitulo),
    });

    const subtitulo = "Certificamos que";
    page.drawText(subtitulo, {
        x: PAGE_WIDTH / 2 - estimateTextWidth(subtitulo, 13) / 2,
        y: PAGE_HEIGHT - 150,
        size: 13,
        color: hexToRgb(data.layout.corTexto),
    });

    page.drawText(data.alunoNome, {
        x: PAGE_WIDTH / 2 - estimateTextWidth(data.alunoNome, 26) / 2,
        y: PAGE_HEIGHT - 200,
        size: 26,
        color: hexToRgb(data.layout.corNome),
    });

    page.drawLine({
        start: { x: PAGE_WIDTH / 2 - 180, y: PAGE_HEIGHT - 215 },
        end: { x: PAGE_WIDTH / 2 + 180, y: PAGE_HEIGHT - 215 },
        color: hexToRgb(data.layout.corNome),
        thickness: 1,
    });

    page.drawText(data.descricao, {
        x: PAGE_WIDTH / 2 - 220,
        y: PAGE_HEIGHT - 260,
        size: 12,
        color: hexToRgb(data.layout.corTexto),
        maxWidth: 440,
        lineHeight: 1.5,
    });

    if (data.cargaHoraria) {
        const chText = `Carga horária: ${data.cargaHoraria} horas`;
        page.drawText(chText, {
            x: PAGE_WIDTH / 2 - estimateTextWidth(chText, 11) / 2,
            y: PAGE_HEIGHT - 320,
            size: 11,
            color: hexToRgb(data.layout.corTexto),
        });
    }

    const emitidoEm = data.emitidoEm.toLocaleDateString("pt-BR");
    page.drawText(`Emitido em: ${emitidoEm}`, {
        x: MARGIN + 40,
        y: MARGIN + 50,
        size: 10,
        color: hexToRgb(data.layout.corTexto),
    });

    if (data.validadeAte) {
        const validade = data.validadeAte.toLocaleDateString("pt-BR");
        page.drawText(`Válido até: ${validade}`, {
            x: PAGE_WIDTH - MARGIN - 160,
            y: MARGIN + 50,
            size: 10,
            color: hexToRgb(data.layout.corTexto),
        });
    }

    page.drawLine({
        start: { x: PAGE_WIDTH / 2 - 100, y: MARGIN + 45 },
        end: { x: PAGE_WIDTH / 2 + 100, y: MARGIN + 45 },
        color: hexToRgb(data.layout.corTexto),
        thickness: 0.5,
    });

    page.drawText("Assinatura do Responsável", {
        x: PAGE_WIDTH / 2 - estimateTextWidth("Assinatura do Responsável", 9) / 2,
        y: MARGIN + 32,
        size: 9,
        color: hexToRgb(data.layout.corTexto),
    });

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
