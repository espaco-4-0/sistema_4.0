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
    const [startStr, endStr] = schedule.split("-");

    const [startHour, startMinute] = startStr.trim().split(":").map(Number);
    const [endHour, endMinute] = endStr.trim().split(":").map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const periodInHours = (endInMinutes - startInMinutes) / 60;
    const courseHours = periodInHours * weekDays.length * durationWeeks;

    return courseHours;
}
