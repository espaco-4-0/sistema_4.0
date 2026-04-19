import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import type { VisitRequest } from "@/src/infra/modules/professor/agenda-visitas-mock";

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface VisitPublicEvent {
    id: number;
    instituicao: string;
    dataVisita: string; // ISO string
    horaInicio: string;
    horaFim: string;
    status: "pendente" | "aprovado" | "negado";
}

// ─── Helpers de mapeamento ────────────────────────────────────────────────────

/** Converte o retorno da API (admin) para o tipo VisitRequest usado no frontend */
export function apiVisitToRequest(visit: any): VisitRequest {
    const dataISO: string = visit.dataVisita ?? visit.data ?? "";
    const data = dataISO.length >= 10 ? dataISO.slice(0, 10) : dataISO;

    return {
        id: visit.id,
        instituicao: visit.instituicao,
        responsavel: visit.responsavel ?? "",
        email: visit.email ?? "",
        whatsapp: visit.whatsapp ?? "",
        quantidade: visit.quantidade ?? 0,
        data,
        horaInicio: visit.horaInicio ?? "09:00",
        horaFim: visit.horaFim ?? "10:00",
        documentos: (visit.documentos ?? []).map((doc: any) => ({
            id: String(doc.id),
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSizeKb: doc.fileSizeKb,
            uploadedAt: typeof doc.uploadedAt === "string" ? doc.uploadedAt : new Date(doc.uploadedAt).toISOString(),
        })),
        mensagem: visit.mensagem ?? undefined,
        status: visit.status ?? "pendente",
        processStage: visit.processStage ?? "aguardando_email",
        ifalStatus: visit.ifalStatus ?? "aguardando",
        documentacaoStatus: visit.documentacaoStatus ?? "pendente",
        motivoNegativa: visit.motivoNegativa ?? undefined,
        createdAt: typeof visit.createdAt === "string" ? visit.createdAt : new Date(visit.createdAt).toISOString(),
        reviewedAt: visit.reviewedAt
            ? typeof visit.reviewedAt === "string"
                ? visit.reviewedAt
                : new Date(visit.reviewedAt).toISOString()
            : undefined,
        processLog: (visit.processLog ?? []).map((entry: any, idx: number) => ({
            id: entry.id ?? `${visit.id}-${idx}`,
            stage: entry.stage,
            description: entry.description,
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date(entry.createdAt).toISOString(),
        })),
    };
}

/** Converte evento público da API para CalendarEvent */
export function publicVisitToCalendarEvent(visit: VisitPublicEvent): CalendarEvent {
    const [startHour = 9, startMinute = 0] = visit.horaInicio.split(":").map(Number);
    const [endHour = 10, endMinute = 0] = visit.horaFim.split(":").map(Number);

    // dataVisita vem como ISO string da API — parsear como data local para evitar offset de fuso
    const datePart = visit.dataVisita.slice(0, 10); // "yyyy-MM-dd"
    const baseDate = new Date(`${datePart}T00:00:00`);

    const start = new Date(baseDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(baseDate);
    end.setHours(endHour, endMinute, 0, 0);
    if (end <= start) end.setHours(endHour + 1, endMinute, 0, 0);

    const type: "agendado" | "aprovado" = visit.status === "aprovado" ? "aprovado" : "agendado";

    return {
        id: visit.id,
        title: `Visita: ${visit.instituicao}`,
        start,
        end,
        type,
        description: "Solicitação de visita.",
        time: `${visit.horaInicio} - ${visit.horaFim}`,
        local: "Espaço 4.0",
    };
}

// ─── POST ─────────────────────────────────────────────────────────────────────

/** Envia solicitação de visita (público, sem auth) */
export async function submitVisitRequest(formData: FormData): Promise<any> {
    const res = await fetch("/api/visits", {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).message || "Erro ao enviar solicitação");
    }
    return res.json();
}

export async function getPublicVisitEvents(): Promise<VisitPublicEvent[]> {
    try {
        const res = await fetch("/api/visits");
        if (!res.ok) return [];
        return (await res.json()) as VisitPublicEvent[];
    } catch {
        return [];
    }
}

/** Busca todas as visitas com dados completos (admin) */
export async function getAdminVisits(): Promise<VisitRequest[]> {
    try {
        const res = await fetch("/api/visits");
        if (!res.ok) return [];
        const data = await res.json();
        return (data as any[]).map(apiVisitToRequest);
    } catch {
        return [];
    }
}

// ─── PATCH actions ────────────────────────────────────────────────────────────

async function visitAction(id: number, action: string, reason?: string): Promise<any> {
    const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).message || "Erro na ação");
    }
    return res.json();
}

export const apiConfirmEmail = (id: number) => visitAction(id, "confirmEmail");
export const apiApproveDocumentation = (id: number) => visitAction(id, "approveDocumentation");
export const apiMarkDocumentationIncomplete = (id: number) => visitAction(id, "markDocumentationIncomplete");
export const apiSendToIfal = (id: number) => visitAction(id, "sendToIfal");
export const apiIfalApprove = (id: number) => visitAction(id, "ifalApprove");
export const apiIfalDeny = (id: number, reason: string) => visitAction(id, "ifalDeny", reason);
export const apiAdminDeny = (id: number, reason: string) => visitAction(id, "adminDeny", reason);

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteVisit(id: number): Promise<void> {
    const res = await fetch(`/api/visits?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).message || "Erro ao remover visita");
    }
}
