export type CalendarEventType = "agendado" | "aprovado";

export interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: CalendarEventType;
    description: string;
    time: string;
    local: string;
    image?: string;
    whatsapp?: string;
    quantidade?: string | number;
    professor?: string;
}

export const calendarEventsMock: CalendarEvent[] = [];
