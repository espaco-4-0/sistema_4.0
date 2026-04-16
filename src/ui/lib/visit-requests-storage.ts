import { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import {
    VisitDocument,
    VisitProcessEntry,
    VisitProcessStage,
    VisitRequest,
    VisitRequestStatus,
    visitRequestsMock,
} from "@/src/infra/modules/professor/agenda-visitas-mock";

export const VISIT_REQUESTS_STORAGE_KEY = "sistema40:visit-requests:v1";

function hasWindow(): boolean {
    return typeof window !== "undefined";
}

function parseRequests(raw: string | null): VisitRequest[] {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as VisitRequest[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeVisitRequest(request: Partial<VisitRequest>, index: number): VisitRequest {
    const createdAt = request.createdAt ?? new Date().toISOString();
    const status = request.status ?? "pendente";
    const stageByStatus: Record<VisitRequestStatus, VisitProcessStage> = {
        pendente: "aguardando_email",
        aprovado: "aprovado_ifal",
        negado: "negado_admin",
    };

    const processStage = request.processStage ?? stageByStatus[status];
    const ifalStatus = request.ifalStatus ?? (status === "aprovado" ? "aprovado" : "aguardando");
    const documentacaoStatus = request.documentacaoStatus ?? "pendente";
    const processLog =
        request.processLog && request.processLog.length > 0
            ? request.processLog
            : [
                  {
                      id: `${request.id ?? Date.now()}-${index + 1}`,
                      stage: processStage,
                      description: "Solicitação carregada e normalizada para o novo fluxo de processo.",
                      createdAt,
                  },
              ];

    return {
        id: request.id ?? Date.now() + index,
        instituicao: request.instituicao ?? "Instituição não informada",
        responsavel: request.responsavel ?? "Responsável não informado",
        email: request.email ?? "",
        whatsapp: request.whatsapp ?? "",
        quantidade: request.quantidade ?? 0,
        data: request.data ?? new Date().toISOString().slice(0, 10),
        horaInicio: request.horaInicio ?? "09:00",
        horaFim: request.horaFim ?? "10:00",
        documentos: (request.documentos as VisitDocument[] | undefined) ?? [],
        mensagem: request.mensagem,
        status,
        processStage,
        ifalStatus,
        documentacaoStatus,
        motivoNegativa: request.motivoNegativa,
        createdAt,
        reviewedAt: request.reviewedAt,
        processLog,
    };
}

export function getVisitRequests(): VisitRequest[] {
    if (!hasWindow()) return visitRequestsMock;

    const stored = parseRequests(window.localStorage.getItem(VISIT_REQUESTS_STORAGE_KEY));
    if (stored.length > 0) {
        const normalized = stored.map((request, index) => normalizeVisitRequest(request, index));
        window.localStorage.setItem(VISIT_REQUESTS_STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    window.localStorage.setItem(VISIT_REQUESTS_STORAGE_KEY, JSON.stringify(visitRequestsMock));
    return visitRequestsMock;
}

export function saveVisitRequests(requests: VisitRequest[]): void {
    if (!hasWindow()) return;
    window.localStorage.setItem(VISIT_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

export function createVisitRequest(
    payload: Omit<
        VisitRequest,
        | "id"
        | "createdAt"
        | "status"
        | "reviewedAt"
        | "motivoNegativa"
        | "processStage"
        | "ifalStatus"
        | "documentacaoStatus"
        | "processLog"
    >
): VisitRequest {
    const requests = getVisitRequests();

    const newRequest: VisitRequest = {
        id: Date.now(),
        status: "pendente",
        processStage: "aguardando_email",
        ifalStatus: "aguardando",
        documentacaoStatus: "pendente",
        createdAt: new Date().toISOString(),
        processLog: [
            {
                id: `${Date.now()}-1`,
                stage: "aguardando_email",
                description: "Solicitação enviada no portal e aguardando confirmação de recebimento do e-mail.",
                createdAt: new Date().toISOString(),
            },
        ],
        ...payload,
    };

    const updated = [newRequest, ...requests];
    saveVisitRequests(updated);

    return newRequest;
}

function appendProcessLog(request: VisitRequest, stage: VisitProcessStage, description: string): VisitProcessEntry[] {
    return [
        ...request.processLog,
        {
            id: `${request.id}-${request.processLog.length + 1}`,
            stage,
            description,
            createdAt: new Date().toISOString(),
        },
    ];
}

function updateRequest(requestId: number, updater: (request: VisitRequest) => VisitRequest): VisitRequest[] {
    const requests = getVisitRequests();
    const updated = requests.map((request) => (request.id === requestId ? updater(request) : request));
    saveVisitRequests(updated);
    return updated;
}

export function confirmEmailReceived(requestId: number): VisitRequest[] {
    return updateRequest(requestId, (request) => {
        if (request.processStage !== "aguardando_email") return request;

        return {
            ...request,
            processStage: "email_recebido",
            processLog: appendProcessLog(
                request,
                "email_recebido",
                "Recebimento do e-mail concluído. Processo segue para análise administrativa."
            ),
        };
    });
}

export function startDocumentationAnalysis(requestId: number, isComplete: boolean): VisitRequest[] {
    return updateRequest(requestId, (request) => {
        if (!["email_recebido", "documentacao_em_analise"].includes(request.processStage)) return request;

        return {
            ...request,
            processStage: "documentacao_em_analise",
            documentacaoStatus: isComplete ? "conferida" : "incompleta",
            processLog: appendProcessLog(
                request,
                "documentacao_em_analise",
                isComplete
                    ? "Documentação conferida pelo admin. Pronto para envio ao IFAL."
                    : "Documentação marcada como incompleta. Necessário ajuste antes do envio ao IFAL."
            ),
        };
    });
}

export function sendToIfalApproval(requestId: number): VisitRequest[] {
    return updateRequest(requestId, (request) => {
        if (request.processStage !== "documentacao_em_analise") return request;
        if (request.documentacaoStatus !== "conferida") return request;

        return {
            ...request,
            processStage: "aguardando_aprovacao_ifal",
            ifalStatus: "aguardando",
            processLog: appendProcessLog(
                request,
                "aguardando_aprovacao_ifal",
                "Processo encaminhado para aprovação institucional do IFAL."
            ),
        };
    });
}

export function setIfalDecision(requestId: number, approved: boolean, reason?: string): VisitRequest[] {
    return updateRequest(requestId, (request) => {
        if (request.processStage !== "aguardando_aprovacao_ifal") return request;

        const stage: VisitProcessStage = approved ? "aprovado_ifal" : "negado_ifal";
        const status: VisitRequestStatus = approved ? "aprovado" : "negado";

        return {
            ...request,
            processStage: stage,
            status,
            ifalStatus: approved ? "aprovado" : "negado",
            reviewedAt: new Date().toISOString(),
            motivoNegativa: approved ? undefined : reason?.trim() || "Processo negado na aprovação final do IFAL.",
            processLog: appendProcessLog(
                request,
                stage,
                approved
                    ? "IFAL aprovou a visita. Agendamento confirmado para a escola solicitante."
                    : `IFAL negou a visita. ${reason?.trim() || "Sem detalhamento enviado."}`
            ),
        };
    });
}

export function denyByAdmin(requestId: number, reason: string): VisitRequest[] {
    return updateRequest(requestId, (request) => {
        if (request.status === "negado") return request;

        return {
            ...request,
            processStage: "negado_admin",
            status: "negado",
            reviewedAt: new Date().toISOString(),
            motivoNegativa: reason.trim() || "Processo negado na análise administrativa.",
            processLog: appendProcessLog(
                request,
                "negado_admin",
                `Solicitação negada pelo admin. ${reason.trim() || "Sem detalhamento enviado."}`
            ),
        };
    });
}

export function requestToCalendarEvent(request: VisitRequest): CalendarEvent | null {
    if (request.status === "negado") return null;

    const [startHour, startMinute] = request.horaInicio.split(":").map(Number);
    const [endHour, endMinute] = request.horaFim.split(":").map(Number);

    const baseDate = new Date(`${request.data}T00:00:00`);
    const start = new Date(baseDate);
    start.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

    if (end <= start) {
        end.setHours((endHour ?? 0) + 1, endMinute ?? 0, 0, 0);
    }

    return {
        id: request.id,
        title: `Visita: ${request.instituicao}`,
        start,
        end,
        type: request.status === "aprovado" ? "aprovado" : "agendado",
        description: request.mensagem || "Solicitação de visita.",
        time: `${request.horaInicio} - ${request.horaFim}`,
        local: "Espaço 4.0",
        professor: request.responsavel,
        whatsapp: request.whatsapp,
        quantidade: String(request.quantidade),
    };
}
