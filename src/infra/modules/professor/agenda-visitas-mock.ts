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

export const visitRequestsMock: VisitRequest[] = [
    {
        id: 900001,
        instituicao: "Escola Estadual Maria de Lourdes",
        responsavel: "Ana Paula Souza",
        email: "ana.lourdes@escola.edu.br",
        whatsapp: "82 99999-1111",
        quantidade: 24,
        data: "2026-04-09",
        horaInicio: "09:00",
        horaFim: "11:00",
        documentos: [
            {
                id: "900001-doc-1",
                fileName: "oficio-escola.pdf",
                fileType: "application/pdf",
                fileSizeKb: 520,
                uploadedAt: "2026-04-03T10:15:00.000Z",
            },
        ],
        mensagem: "Turma do 8o ano interessada em robótica e impressão 3D.",
        status: "pendente",
        processStage: "aguardando_email",
        ifalStatus: "aguardando",
        documentacaoStatus: "pendente",
        createdAt: "2026-04-03T10:15:00.000Z",
        processLog: [
            {
                id: "900001-1",
                stage: "aguardando_email",
                description: "Solicitação enviada no portal e aguardando confirmação de recebimento do e-mail.",
                createdAt: "2026-04-03T10:15:00.000Z",
            },
        ],
    },
    {
        id: 900002,
        instituicao: "Colégio Integrado São José",
        responsavel: "Carlos Henrique Melo",
        email: "carlos.melo@saojose.edu.br",
        whatsapp: "82 98888-2323",
        quantidade: 18,
        data: "2026-04-11",
        horaInicio: "14:00",
        horaFim: "16:00",
        documentos: [
            {
                id: "900002-doc-1",
                fileName: "lista-alunos-11a.pdf",
                fileType: "application/pdf",
                fileSizeKb: 438,
                uploadedAt: "2026-04-02T08:47:00.000Z",
            },
            {
                id: "900002-doc-2",
                fileName: "autorizacao-direcao.pdf",
                fileType: "application/pdf",
                fileSizeKb: 310,
                uploadedAt: "2026-04-02T08:49:00.000Z",
            },
        ],
        mensagem: "Visita técnica para conhecer os laboratórios e projetos de energia.",
        status: "aprovado",
        processStage: "aprovado_ifal",
        ifalStatus: "aprovado",
        documentacaoStatus: "conferida",
        createdAt: "2026-04-02T08:45:00.000Z",
        reviewedAt: "2026-04-02T15:20:00.000Z",
        processLog: [
            {
                id: "900002-1",
                stage: "aguardando_email",
                description: "Solicitação enviada no portal.",
                createdAt: "2026-04-02T08:45:00.000Z",
            },
            {
                id: "900002-2",
                stage: "email_recebido",
                description: "Recebimento do e-mail confirmado pelo admin.",
                createdAt: "2026-04-02T09:10:00.000Z",
            },
            {
                id: "900002-3",
                stage: "documentacao_em_analise",
                description: "Documentação conferida e liberada para análise institucional.",
                createdAt: "2026-04-02T10:20:00.000Z",
            },
            {
                id: "900002-4",
                stage: "aguardando_aprovacao_ifal",
                description: "Processo enviado para aprovação final do IFAL.",
                createdAt: "2026-04-02T12:00:00.000Z",
            },
            {
                id: "900002-5",
                stage: "aprovado_ifal",
                description: "IFAL aprovou a visita. Agendamento confirmado.",
                createdAt: "2026-04-02T15:20:00.000Z",
            },
        ],
    },
    {
        id: 900003,
        instituicao: "Escola Municipal Sol Nascente",
        responsavel: "Fernanda Rocha",
        email: "fernanda.rocha@solnascente.edu.br",
        whatsapp: "82 97777-4545",
        quantidade: 32,
        data: "2026-04-10",
        horaInicio: "10:00",
        horaFim: "12:00",
        documentos: [],
        mensagem: "Solicitação para visita com foco em tecnologia educacional.",
        status: "negado",
        processStage: "negado_admin",
        ifalStatus: "aguardando",
        documentacaoStatus: "incompleta",
        motivoNegativa: "Capacidade máxima de 30 estudantes por visita neste turno.",
        createdAt: "2026-04-01T11:30:00.000Z",
        reviewedAt: "2026-04-01T17:40:00.000Z",
        processLog: [
            {
                id: "900003-1",
                stage: "aguardando_email",
                description: "Solicitação enviada no portal.",
                createdAt: "2026-04-01T11:30:00.000Z",
            },
            {
                id: "900003-2",
                stage: "email_recebido",
                description: "Recebimento do e-mail confirmado pelo admin.",
                createdAt: "2026-04-01T12:00:00.000Z",
            },
            {
                id: "900003-3",
                stage: "documentacao_em_analise",
                description: "Análise documental iniciada.",
                createdAt: "2026-04-01T14:20:00.000Z",
            },
            {
                id: "900003-4",
                stage: "negado_admin",
                description: "Processo negado na triagem administrativa por documentação/capacidade.",
                createdAt: "2026-04-01T17:40:00.000Z",
            },
        ],
    },
];
