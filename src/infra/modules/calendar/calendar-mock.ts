export type CalendarEvent = {
    id: string | number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    type: "agendado" | "aprovado" | "holiday";
    description?: string;
    time?: string;
    local?: string;
    professor?: string;
    whatsapp?: string;
    quantidade?: string;
    isHoliday?: boolean;
    holidayName?: string | null;
    image?: string;
};

export const calendarEventsMock: CalendarEvent[] = [];
