import { getHolidayNameSafe, isHolidayOrWeekend } from "./holiday-utils";

export type Slot = {
    id: string;
    start: string;
    end: string;
    label: string;
    maxCapacity?: number;
    events?: string[];
};

export const MIN_EVENT_GAP_MINUTES = 30;

export const DEFAULT_SLOTS: Slot[] = [
    { id: "slot-0700-0800", start: "07:00", end: "08:00", label: "07:00 – 08:00" },
    { id: "slot-0800-0900", start: "08:00", end: "09:00", label: "08:00 – 09:00" },
    { id: "slot-0900-1000", start: "09:00", end: "10:00", label: "09:00 – 10:00" },
    { id: "slot-1000-1100", start: "10:00", end: "11:00", label: "10:00 – 11:00" },
    { id: "slot-1100-1200", start: "11:00", end: "12:00", label: "11:00 – 12:00" },
    { id: "slot-1300-1400", start: "13:00", end: "14:00", label: "13:00 – 14:00" },
    { id: "slot-1400-1500", start: "14:00", end: "15:00", label: "14:00 – 15:00" },
    { id: "slot-1500-1600", start: "15:00", end: "16:00", label: "15:00 – 16:00" },
    { id: "slot-1600-1700", start: "16:00", end: "17:00", label: "16:00 – 17:00" },
    { id: "slot-1700-1800", start: "17:00", end: "18:00", label: "17:00 – 18:00" },
];

export function hhmmToMinutes(hhmm: string): number {
    const [hStr, mStr] = (hhmm ?? "").split(":");
    const h = Number.parseInt(hStr ?? "0", 10);
    const m = Number.parseInt(mStr ?? "0", 10);
    return h * 60 + m;
}

export function minutesToHHMM(mins: number): string {
    const h = Math.floor(mins / 60)
        .toString()
        .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function slotIdFromTimes(start: string, end: string): string {
    return `slot-${start.replace(":", "")}-${end.replace(":", "")}`;
}

export function getSlotsForDate(_date: Date): Slot[] {
    return DEFAULT_SLOTS;
}

export function findSlotById(slotId: string | null | undefined, date?: Date): Slot | undefined {
    if (!slotId) return undefined;
    const slots = date ? getSlotsForDate(date) : DEFAULT_SLOTS;
    return slots.find((s) => s.id === slotId);
}

export function findSlotByTimes(start: string, end: string, date?: Date): Slot | undefined {
    const slots = date ? getSlotsForDate(date) : DEFAULT_SLOTS;
    return slots.find((s) => s.start === start && s.end === end);
}

export function validateSlotForDate(
    date: Date,
    slotId: string
): { valid: true } | { valid: false; message: string; holidayName?: string } {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d < today) {
        return { valid: false, message: "Não é possível agendar em datas passadas." };
    }

    if (isHolidayOrWeekend(d)) {
        const hName = getHolidayNameSafe(d);
        const msg = hName
            ? `Data é feriado (${hName}). Não é permitido agendar.`
            : "Finais de semana ou feriados não estão disponíveis.";
        return { valid: false, message: msg, holidayName: hName ?? undefined };
    }

    const slot = findSlotById(slotId, d);
    if (!slot) {
        return { valid: false, message: "Slot inválido para a data informada." };
    }

    return { valid: true };
}

export function hasSlotConflict(
    slot: Slot,
    date: Date,
    existingEvents: Array<{ horaInicio: string; horaFim: string }>,
    minGapMinutes: number = MIN_EVENT_GAP_MINUTES
): boolean {
    const startMin = hhmmToMinutes(slot.start);
    const endMin = hhmmToMinutes(slot.end);

    for (const ev of existingEvents) {
        const evStart = hhmmToMinutes(ev.horaInicio);
        let evEnd = hhmmToMinutes(ev.horaFim);

        if (evEnd <= evStart) evEnd = evStart + 60;

        const startBoundary = evStart - minGapMinutes;
        const endBoundary = evEnd + minGapMinutes;

        if (startMin < endBoundary && endMin > startBoundary) {
            return true;
        }
    }
    return false;
}

export async function enforceSlotSelection(
    request: { date: Date | string; slotId: string; eventType?: string },
    existingEventsFetcher: (date: Date) => Promise<Array<{ horaInicio: string; horaFim: string }>>,
    minGapMinutes: number = MIN_EVENT_GAP_MINUTES
): Promise<{ ok: true; slot: Slot } | { ok: false; status: number; message: string; holidayName?: string }> {
    const dateObj = new Date(request.date);
    if (isNaN(dateObj.getTime())) {
        return { ok: false, status: 400, message: "Data inválida." };
    }
    dateObj.setHours(0, 0, 0, 0);

    const validation = validateSlotForDate(dateObj, request.slotId);
    if (!validation.valid) {
        const status = validation.message.includes("conflito") ? 409 : 400;
        return { ok: false, status, message: validation.message, holidayName: (validation as any).holidayName };
    }

    const slot = findSlotById(request.slotId, dateObj);
    if (!slot) {
        return { ok: false, status: 400, message: "Slot não encontrado." };
    }

    const existing = await existingEventsFetcher(dateObj);

    const conflict = hasSlotConflict(slot, dateObj, existing, minGapMinutes);
    if (conflict) {
        return {
            ok: false,
            status: 409,
            message: `Conflito com outro agendamento. Mantenha pelo menos ${minGapMinutes} minutos entre eventos.`,
        };
    }

    return { ok: true, slot };
}

export function slotIdForEvent(horaInicio: string, horaFim: string, date?: Date): string | undefined {
    const slot = findSlotByTimes(horaInicio, horaFim, date);
    return slot?.id;
}
