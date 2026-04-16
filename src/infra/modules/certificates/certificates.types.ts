export type CertificateLayout = Record<string, string>;

export interface CreateTemplateSchema {
    titulo: string;
    descricao?: string;
    tipo: string;
    cargaHoraria?: number | null;
    layout: CertificateLayout;
}

export interface PatchTemplateSchema extends Partial<CreateTemplateSchema> {
    status?: "ATIVO" | "INATIVO";
}

export interface EmitCertificateSchema {
    templateId: string;
    alunoId: string;
    curso: string;
    validadeAte?: Date;
}

export interface EmitBatchCertificateSchema {
    templateId: string;
    alunoIds: string[];
    curso: string;
    validadeAte?: Date;
}

export interface CertificateTemplate {
    id: string;
    titulo: string;
    descricao: string;
    tipo: string;
    cargaHoraria: number | null;
    layout: CertificateLayout;
    status: "ATIVO" | "INATIVO";
    criadoPor: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CertificateEmission {
    id: string;
    templateId: string;
    alunoId: string;
    arquivoUrl: string;
    curso: string;
    emitidoPor: string;
    emitidoEm: Date;
    validadeAte: Date | null;
    ultimoDownload: Date | null;
    totalDownloads: number;
}
