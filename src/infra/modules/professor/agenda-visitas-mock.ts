export type VisitRequestStatus = "pendente" | "aprovado" | "negado";

export type VisitProcessStage =
    | "aguardando_email"
    | "email_recebido"
    | "documentacao_em_analise"
    | "aguardando_aprovacao_ifal"
    | "aprovado_ifal"
    | "negado_admin"
    | "negado_ifal";

export interface VisitProcessEntry {
    id: string;
    stage: VisitProcessStage;
    description: string;
    createdAt: string;
}

export interface VisitDocument {
    id: string;
    fileName: string;
    fileType: string;
    fileSizeKb: number;
    uploadedAt: string;
}

export interface VisitParada {
    id: number;
    localId: string;
    nome: string;
}

export interface VisitRequest {
    id: number;
    instituicao: string;
    responsavel: string;
    email: string;
    whatsapp: string;
    quantidade: number;
    data: string;
    horaInicio: string;
    horaFim: string;
    documentos: VisitDocument[];
    paradas: VisitParada[];
    mensagem?: string;
    status: VisitRequestStatus;
    processStage: VisitProcessStage;
    ifalStatus: "aguardando" | "aprovado" | "negado";
    documentacaoStatus: "pendente" | "conferida" | "incompleta";
    motivoNegativa?: string;
    createdAt: string;
    reviewedAt?: string;
    processLog: VisitProcessEntry[];
}

export const visitRequestsMock: VisitRequest[] = [];
