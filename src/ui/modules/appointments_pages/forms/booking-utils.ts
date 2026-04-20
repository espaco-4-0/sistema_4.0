export type Stop = {
    id: string;
    label: string;
    dur: number;
};

export const STOPS: Stop[] = [
    { id: "labx", label: "Laboratório X", dur: 30 },
    { id: "labA", label: "Laboratório Biomedicos", dur: 20 },
    { id: "espaco", label: "Espaço 4.0", dur: 40 },
    { id: "biblio", label: "Biblioteca", dur: 25 },
    { id: "maker", label: "Sala Maker", dur: 35 },
    { id: "auditorio", label: "Auditório", dur: 20 },
];

export const START_HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export function toMinutes(hhmm: string): number {
    const [hStr = "0", mStr = "0"] = hhmm.split(":");
    const h = Number(hStr) || 0;
    const m = Number(mStr) || 0;
    return h * 60 + m;
}

export function toHHMM(mins: number): string {
    const safe = Math.max(0, Math.round(mins));
    const h = Math.floor(safe / 60)
        .toString()
        .padStart(2, "0");
    const m = (safe % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function resolveHoraFim(horaInicio: string, paradaIds: string[]): string {
    const active = STOPS.filter((s) => paradaIds.includes(s.id));
    const total = active.reduce((acc, s) => acc + s.dur, 0);
    return toHHMM(toMinutes(horaInicio) + total);
}

/**
 * Formata número de telefone (pt-BR) de forma simples.
 * - Remove caracteres não numéricos
 * - Agrupa até DDD (2 dígitos), prefixo (até 5), sufixo (até 4)
 *
 * Exemplos:
 * - "11987654321" -> "11 98765-4321"
 * - "11987" -> "11 987"
 */
export function formatPhoneNumber(value: string): string {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    const regex = /^(\d{0,2})(\d{0,5})(\d{0,4})$/;
    const match = regex.exec(cleaned);
    if (!match) return value;
    const [, ddd = "", prefixo = "", sufixo = ""] = match;
    if (!prefixo) return ddd;
    const base = `${ddd} ${prefixo}`.trim();
    return sufixo ? `${base}-${sufixo}` : base;
}

/**
 * Resumo das paradas selecionadas.
 * Retorna os stops ativos e o total em minutos.
 */
export function summarizeStops(paradaIds: string[]): { stops: Stop[]; totalMinutes: number } {
    const stops = STOPS.filter((s) => paradaIds.includes(s.id));
    const totalMinutes = stops.reduce((a, s) => a + s.dur, 0);
    return { stops, totalMinutes };
}

/**
 * Gera uma timeline (array) com as paradas e seus intervalos [from, to] em HH:MM,
 * baseado em uma hora de início e na ordem das paradas selecionadas.
 *
 * Útil para montar o resumo/timeline UI.
 *
 * Example return:
 * [
 *   { stop: Stop, from: "09:00", to: "09:30" },
 *   { stop: Stop, from: "09:30", to: "09:50" },
 * ]
 */
export function buildTimeline(horaInicio: string, paradaIds: string[]) {
    const active = STOPS.filter((s) => paradaIds.includes(s.id));
    const inicioMin = toMinutes(horaInicio || START_HOURS[0]);
    let acc = inicioMin;
    return active.map((s) => {
        const from = toHHMM(acc);
        const to = toHHMM(acc + s.dur);
        acc += s.dur;
        return { stop: s, from, to };
    });
}

export function validateQuantity(
    quantityStr: string,
    maxStudents: number | null = null
): { valid: boolean; message?: string } {
    const q = Number.parseInt(quantityStr as string, 10);
    if (!Number.isFinite(q) || q <= 0) {
        return { valid: false, message: "Informe a quantidade de alunos." };
    }
    if (maxStudents !== null && q > maxStudents) {
        return { valid: false, message: `Máximo de ${maxStudents} alunos.` };
    }
    return { valid: true };
}
