import { differenceInCalendarWeeks, parseISO } from "date-fns";

export function formatDateBR(dateISO: string): string {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateISO));
}

export function getPeriodWeeks(startDate: string, endDate: string) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return differenceInCalendarWeeks(end, start, { weekStartsOn: 1 }) + 1;
}
