import { differenceInCalendarWeeks, parseISO } from "date-fns";

export function formatDateBR(dateISO: string): string {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateISO));
}

export function getPeriodWeeks(startDate: string, endDate: string) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return differenceInCalendarWeeks(end, start, { weekStartsOn: 1 }) + 1;
}

export function getHoursOfPeriod(weekDays: string[], schedule: string, durationWeeks: number) {
    if (!schedule || !schedule.includes("-")) {
        return null;
    }

    const [startStr, endStr] = schedule.split("-").map((part) => part?.trim());
    if (!startStr || !endStr) {
        return null;
    }

    const [startHour, startMinute] = startStr.split(":").map(Number);
    const [endHour, endMinute] = endStr.split(":").map(Number);
    if ([startHour, startMinute, endHour, endMinute].some((value) => Number.isNaN(value))) {
        return null;
    }

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    if (endInMinutes <= startInMinutes || durationWeeks <= 0 || weekDays.length === 0) {
        return null;
    }

    const periodInHours = (endInMinutes - startInMinutes) / 60;
    const courseHours = periodInHours * weekDays.length * durationWeeks;

    return courseHours;
}

export function formatMonthShort(date: Date) {
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return months[date.getMonth()];
}
