import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import {
    sendApprovalEmail,
    sendDenialEmail,
    sendEmailReceivedConfirmation,
    sendNewRequestNotificationToAdmin,
    sendRequestConfirmationToApplicant,
} from "@/src/lib/email";
import { AppError, ConflictError, NotFoundError, ValidationError } from "@/src/lib/errors/AppError";
import { getSignedDownloadUrl, uploadVisitDocument } from "@/src/lib/supabase-server";
import { buildHolidayMap, getHolidayNameSafe } from "@/src/lib/visits/holiday-utils";
import { hhmmToMinutes } from "@/src/lib/visits/slots";

export interface CalendarEvent {
    id: string | number;
    instituicao: string;
    dataVisita: string;
    horaInicio: string;
    horaFim: string;
    status: string;
    isHoliday?: boolean;
    holidayName?: string;
}

export function isAdmin(role: string): boolean {
    return role === "ADMIN" || role === "admin";
}

function toComparableDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00`);
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
        return new Date(`${value}T00:00:00`);
    }
    return new Date(0);
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Maceio" });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function listVisitsForAdmin() {
    return prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            VisitDocument: {
                select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
            },
            VisitLocation: {
                include: {
                    Location: {
                        select: { name: true },
                    },
                },
            },
        },
    });
}

export async function listPublicCalendarEvents(): Promise<CalendarEvent[]> {
    const visits = await prisma.visit.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, institution: true, visitDate: true, startTime: true, endTime: true, status: true },
    });

    const year = new Date().getFullYear();
    const holidaysMap = buildHolidayMap(year);

    let negativeId = -1;
    const holidayEntries = Array.from(holidaysMap.entries());

    const holidayEvents: CalendarEvent[] = holidayEntries.map(([dateIso, name]) => {
        const ev: CalendarEvent = {
            id: negativeId,
            instituicao: `Feriado: ${name}`,
            dataVisita: dateIso,
            horaInicio: "00:00",
            horaFim: "23:59",
            status: "feriado",
            isHoliday: true,
            holidayName: name,
        };
        negativeId -= 1;
        return ev;
    });

    const statusMap: Record<string, string> = {
        PENDING: "pendente",
        APPROVED: "aprovado",
        DENIED: "negado",
    };

    const normalizedVisits: CalendarEvent[] = visits.map((v) => {
        const data = v.visitDate;
        const dateStr = data instanceof Date ? data.toISOString().slice(0, 10) : String(data).slice(0, 10);
        return {
            id: v.id,
            instituicao: v.institution,
            dataVisita: dateStr,
            horaInicio: v.startTime ?? "00:00",
            horaFim: v.endTime ?? "00:00",
            status: v.status ? (statusMap[v.status] ?? "pendente") : "pendente",
        };
    });

    return [...normalizedVisits, ...holidayEvents].sort((a, b) => {
        const da = toComparableDate(a.dataVisita);
        const db = toComparableDate(b.dataVisita);
        if (da.getTime() !== db.getTime()) return da.getTime() - db.getTime();

        const aStart = typeof a.horaInicio === "string" ? a.horaInicio : "00:00";
        const bStart = typeof b.horaInicio === "string" ? b.horaInicio : "00:00";
        const [ah, am] = aStart.split(":").map((s) => Number.parseInt(s, 10) || 0);
        const [bh, bm] = bStart.split(":").map((s) => Number.parseInt(s, 10) || 0);
        return ah * 60 + am - (bh * 60 + bm);
    });
}

export async function createVisitFromFormData(formData: FormData) {
    const instituicao = formData.get("instituicao") as string | null;
    const responsavel = formData.get("responsavel") as string | null;
    const email = formData.get("email") as string | null;
    const whatsapp = formData.get("whatsapp") as string | null;
    const quantidadeRaw = formData.get("quantidade") as string | null;
    const dataVisitaRaw = formData.get("dataVisita") as string | null;
    const horaInicio = formData.get("horaInicio") as string | null;
    const horaFim = formData.get("horaFim") as string | null;
    const mensagem = formData.get("mensagem") as string | null;
    const paradasRaw = formData.get("paradas") as string | null;

    if (!instituicao || !responsavel || !email || !whatsapp || !dataVisitaRaw || !horaInicio || !horaFim) {
        throw new ValidationError("Campos obrigatórios faltando");
    }

    const quantidade = parseInt(quantidadeRaw ?? "", 10);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
        throw new ValidationError("Quantidade inválida");
    }

    const files = formData.getAll("anexos") as File[];

    for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;
        if (file.size > MAX_FILE_SIZE) {
            throw new AppError(`Arquivo "${file.name}" excede o limite de 5MB`, 413, "PAYLOAD_TOO_LARGE");
        }
    }

    const visitDateStr = dataVisitaRaw.includes("T") ? dataVisitaRaw : `${dataVisitaRaw}T00:00:00`;
    const visitDate = new Date(visitDateStr);

    if (isNaN(visitDate.getTime())) {
        throw new ValidationError("Data inválida");
    }

    const dayOfWeek = visitDate.getDay();
    const dateStr = visitDate.toISOString().slice(0, 10);

    const dateOverride = await prisma.visitDateRule.findUnique({
        where: { date: new Date(`${dateStr}T00:00:00`) },
    });

    let isAvailable = true;
    let blockedReason = "";

    if (dateOverride) {
        isAvailable = dateOverride.isAvailable;
        blockedReason = dateOverride.reason || "Data bloqueada para visitação.";
    } else {
        const holidayName = getHolidayNameSafe(visitDate);
        if (holidayName) {
            isAvailable = false;
            blockedReason = `Feriado: ${holidayName}`;
        } else {
            const weekdayRule = await prisma.visitWeekdayRule.findUnique({
                where: { dayOfWeek },
            });
            if (weekdayRule) {
                isAvailable = weekdayRule.isAvailable;
            } else {
                isAvailable = dayOfWeek !== 0 && dayOfWeek !== 6;
            }

            if (!isAvailable) {
                blockedReason = "Finais de semana ou dias não permitidos.";
            }
        }
    }

    if (!isAvailable) {
        throw new ValidationError(blockedReason);
    }

    const dateStart = new Date(visitDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateNext = new Date(dateStart);
    dateNext.setDate(dateNext.getDate() + 1);

    const existingEvents = await prisma.visit.findMany({
        where: {
            AND: [{ visitDate: { gte: dateStart } }, { visitDate: { lt: dateNext } }, { status: { not: "DENIED" } }],
        },
        select: { startTime: true, endTime: true },
    });

    const startMin = hhmmToMinutes(horaInicio);
    const endMin = hhmmToMinutes(horaFim);
    const minGap = 30;

    for (const ev of existingEvents) {
        const evStart = hhmmToMinutes(ev.startTime);
        const evEnd = hhmmToMinutes(ev.endTime);

        const startBoundary = evStart - minGap;
        const endBoundary = evEnd + minGap;

        if (startMin < endBoundary && endMin > startBoundary) {
            throw new ConflictError("Conflito de horário com outra visita (mínimo 30 min de intervalo).");
        }
    }

    const initialLog: Prisma.InputJsonValue[] = [
        {
            id: `log-${Date.now()}-1`,
            stage: "WAITING_EMAIL",
            description: `Solicitação enviada no portal. Horário: ${horaInicio} - ${horaFim}`,
            createdAt: new Date().toISOString(),
        },
    ];

    let paradas: string[] = [];
    try {
        if (paradasRaw) paradas = JSON.parse(paradasRaw) as string[];
    } catch (e) {
        console.error("Erro ao fazer parse das paradas:", e);
    }

    const visit = await prisma.visit.create({
        data: {
            institution: instituicao,
            responsible: responsavel,
            email,
            whatsapp,
            visitorCount: quantidade,
            visitDate,
            startTime: horaInicio,
            endTime: horaFim,
            message: mensagem || null,
            processLog: initialLog,
            VisitLocation: {
                create: paradas.map((localId) => ({
                    locationId: localId,
                })),
            },
        },
    });

    const documentosData: Array<{
        fileName: string;
        fileType: string;
        fileSizeKb: number;
        storagePath: string;
    }> = [];

    for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;
        try {
            const storagePath = await uploadVisitDocument(visit.id, file);
            documentosData.push({
                fileName: file.name,
                fileType: file.type || "application/octet-stream",
                fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
                storagePath,
            });
        } catch (uploadError) {
            console.error(`Erro ao fazer upload de "${file.name}":`, uploadError);
            await prisma.visit.delete({ where: { id: visit.id } }).catch(() => null);
            throw new AppError(
                `Erro ao enviar o anexo "${file.name}". Solicitação cancelada, tente novamente.`,
                500,
                "UPLOAD_ERROR"
            );
        }
    }

    if (documentosData.length > 0) {
        await prisma.visitDocument.createMany({
            data: documentosData.map((d) => ({ ...d, visitId: visit.id })),
        });
    }

    const visitWithDocs = await prisma.visit.findUnique({
        where: { id: visit.id },
        include: {
            VisitDocument: {
                select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
            },
        },
    });

    const safeFormattedDate = dataVisitaRaw.split("-").reverse().join("/");

    const emailData = {
        visitId: visit.id,
        instituicao,
        responsavel,
        email,
        quantidade,
        data: safeFormattedDate,
        horaInicio,
        horaFim,
        mensagem: mensagem || undefined,
    };

    Promise.all([
        sendRequestConfirmationToApplicant(emailData).catch((e: unknown) =>
            console.error("[email] Confirmação ao solicitante:", e)
        ),
        sendNewRequestNotificationToAdmin(emailData).catch((e: unknown) =>
            console.error("[email] Notificação ao admin:", e)
        ),
    ]);

    return visitWithDocs;
}

export async function executeVisitPatchAction(body: { id?: number; action?: string; reason?: string }) {
    const { id, action, reason } = body;

    if (!id || !action) {
        throw new ValidationError("ID e ação são obrigatórios");
    }

    const current = await prisma.visit.findUnique({ where: { id } });
    if (!current) {
        throw new NotFoundError("Visita", String(id));
    }

    const now = new Date().toISOString();
    const visitId = current.id;
    const currentLog = Array.isArray(current.processLog) ? (current.processLog as Prisma.InputJsonValue[]) : [];

    function appendLog(stage: string, description: string): Prisma.InputJsonValue[] {
        return [...currentLog, { id: `log-${visitId}-${currentLog.length + 1}`, stage, description, createdAt: now }];
    }

    let updateData: Prisma.VisitUpdateInput = {};
    let emailTask: Promise<void> | null = null;

    switch (action) {
        case "confirmEmail":
            if (current.processStage !== "WAITING_EMAIL") {
                throw new ValidationError("Estágio inválido");
            }
            updateData = {
                processStage: "EMAIL_RECEIVED",
                processLog: appendLog("EMAIL_RECEIVED", "Recebimento do e-mail confirmado pelo admin."),
            };
            emailTask = sendEmailReceivedConfirmation(current.email, current.responsible, current.institution);
            break;

        case "approveDocumentation":
            if (!["EMAIL_RECEIVED", "DOCUMENTS_UNDER_REVIEW"].includes(current.processStage)) {
                throw new ValidationError("Estágio inválido");
            }
            updateData = {
                processStage: "DOCUMENTS_UNDER_REVIEW",
                documentationStatus: "CHECKED",
                processLog: appendLog(
                    "DOCUMENTS_UNDER_REVIEW",
                    "Documentação conferida pelo admin. Pronto para envio ao IFAL."
                ),
            };
            break;

        case "markDocumentationIncomplete":
            if (!["EMAIL_RECEIVED", "DOCUMENTS_UNDER_REVIEW"].includes(current.processStage)) {
                throw new ValidationError("Estágio inválido");
            }
            updateData = {
                processStage: "DOCUMENTS_UNDER_REVIEW",
                documentationStatus: "INCOMPLETE",
                processLog: appendLog(
                    "DOCUMENTS_UNDER_REVIEW",
                    "Documentação marcada como incompleta. Necessário ajuste antes do envio ao IFAL."
                ),
            };
            break;

        case "sendToIfal":
            if (current.processStage !== "DOCUMENTS_UNDER_REVIEW" || current.documentationStatus !== "CHECKED") {
                throw new ValidationError("Documentação precisa estar conferida para enviar ao IFAL");
            }
            updateData = {
                processStage: "WAITING_IFAL_APPROVAL",
                ifalStatus: "PENDING",
                processLog: appendLog(
                    "WAITING_IFAL_APPROVAL",
                    "Processo encaminhado para aprovação institucional do IFAL."
                ),
            };
            break;

        case "ifalApprove":
            if (current.processStage !== "WAITING_IFAL_APPROVAL") {
                throw new ValidationError("Estágio inválido");
            }
            updateData = {
                processStage: "APPROVED_IFAL",
                status: "APPROVED",
                ifalStatus: "APPROVED",
                reviewedAt: new Date(),
                processLog: appendLog(
                    "APPROVED_IFAL",
                    "IFAL aprovou a visita. Agendamento confirmado para a escola solicitante."
                ),
            };
            emailTask = sendApprovalEmail(
                current.email,
                current.responsible,
                formatDate(current.visitDate),
                current.startTime,
                current.endTime,
                current.institution
            );
            break;

        case "ifalDeny":
            if (current.processStage !== "WAITING_IFAL_APPROVAL") {
                throw new ValidationError("Estágio inválido");
            }
            updateData = {
                processStage: "DENIED_IFAL",
                status: "DENIED",
                ifalStatus: "DENIED",
                reviewedAt: new Date(),
                rejectionReason: reason?.trim() || "Processo negado na aprovação final do IFAL.",
                processLog: appendLog(
                    "DENIED_IFAL",
                    `IFAL negou a visita. ${reason?.trim() || "Sem detalhamento enviado."}`
                ),
            };
            emailTask = sendDenialEmail(
                current.email,
                current.responsible,
                current.institution,
                reason?.trim() || "Processo negado na aprovação final do IFAL."
            );
            break;

        case "adminDeny":
            if (current.status === "DENIED") {
                throw new ValidationError("Visita já negada");
            }
            if (!reason?.trim()) {
                throw new ValidationError("Motivo da negativa é obrigatório");
            }
            updateData = {
                processStage: "DENIED_ADMIN",
                status: "DENIED",
                reviewedAt: new Date(),
                rejectionReason: reason.trim(),
                processLog: appendLog("DENIED_ADMIN", `Solicitação negada pelo admin. ${reason.trim()}`),
            };
            emailTask = sendDenialEmail(current.email, current.responsible, current.institution, reason.trim());
            break;

        default:
            throw new ValidationError("Ação inválida");
    }

    const updated = await prisma.visit.update({
        where: { id },
        data: updateData,
        include: {
            VisitDocument: {
                select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
            },
        },
    });

    if (emailTask) {
        emailTask.catch((e: unknown) => console.error("[email] PATCH action:", action, e));
    }

    return updated;
}

export async function deleteVisitById(id: number) {
    if (!id || Number.isNaN(id)) {
        throw new ValidationError("ID inválido");
    }

    await prisma.visit.delete({ where: { id } });
    return { message: "Visita removida com sucesso" };
}

export async function getVisitDocumentDownloadUrl(docId: number) {
    if (!docId || Number.isNaN(docId)) {
        throw new ValidationError("ID inválido");
    }

    const doc = await prisma.visitDocument.findUnique({ where: { id: docId } });
    if (!doc) {
        throw new NotFoundError("Documento", String(docId));
    }

    return await getSignedDownloadUrl(doc.storagePath);
}
