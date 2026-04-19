"use client";

import { useCallback } from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { Button } from "@/src/ui/components/ui/button";
import { format, getDay, isSameDay, isSameMonth, isToday, isWeekend, parse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type ToolbarProps = {
    date: Date;
    onNavigate: (action: "PREV" | "TODAY" | "NEXT") => void;
};

function Toolbar({ date, onNavigate }: ToolbarProps) {
    const today = new Date();
    const month = format(date, "MMMM", { locale: ptBR });
    const year = format(date, "yyyy");

    const isCurrentMonth = isSameMonth(date, today);

    const handlePrev = useCallback(() => {
        if (!isCurrentMonth) onNavigate("PREV");
    }, [onNavigate, isCurrentMonth]);
    const handleToday = useCallback(() => onNavigate("TODAY"), [onNavigate]);
    const handleNext = useCallback(() => onNavigate("NEXT"), [onNavigate]);

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-2 pb-4 lg:pb-6 pt-1 gap-3 lg:gap-0">
            <div className="flex gap-2 lg:gap-4 items-center">
                <div>
                    <div className="flex gap-1 items-center font-medium text-sm lg:text-base">
                        <span className="capitalize">
                            {month}, {year}
                        </span>
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600">Calendário de Visitas</span>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
                <Button
                    onClick={handlePrev}
                    variant="outline"
                    disabled={isCurrentMonth}
                    className={`h-9 lg:h-10 px-2 lg:px-4 ${isCurrentMonth ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                    type="button"
                >
                    <ChevronLeft className="size-4 lg:size-5" />
                </Button>
                <Button
                    onClick={handleToday}
                    className="bg-yellow-primary hover:bg-yellow-primary-dark border-none text-black h-9 lg:h-10 cursor-pointer text-sm lg:text-base flex-1 lg:flex-none"
                    type="button"
                >
                    Hoje
                </Button>
                <Button
                    onClick={handleNext}
                    variant="outline"
                    className="h-9 lg:h-10 cursor-pointer px-2 lg:px-4"
                    type="button"
                >
                    <ChevronRight className="size-4 lg:size-5" />
                </Button>
            </div>
        </div>
    );
}

type UnifiedVisitCalendarProps = {
    events: CalendarEvent[];
    selectedDate: Date;
    viewDate: Date;
    onViewDateChange: (date: Date) => void;
    onSelectDay: (date: Date) => void;
    onSelectEvent?: (event: CalendarEvent) => void;
    height?: number;
    className?: string;
};

export function UnifiedVisitCalendar({
    events,
    selectedDate,
    viewDate,
    onViewDateChange,
    onSelectDay,
    onSelectEvent,
    height = 520,
    className = "calendar-mobile",
}: UnifiedVisitCalendarProps) {
    return (
        <Calendar
            localizer={localizer}
            events={events}
            date={viewDate}
            onNavigate={onViewDateChange}
            selectable
            onSelectSlot={(slot) => onSelectDay(slot.start)}
            onSelectEvent={(event) => {
                onSelectDay(event.start);
                onSelectEvent?.(event as CalendarEvent);
            }}
            style={{ height }}
            className={className}
            culture="pt-BR"
            views={["month"]}
            components={{ toolbar: Toolbar }}
            dayPropGetter={(date) => {
                const hasEvents = events.filter((event) => isSameDay(event.start, date));
                const isToday = isSameDay(date, new Date());
                const weekend = date.getDay() === 0 || date.getDay() === 6;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                let classes = "transition-all ";

                if (weekend || isPast) {
                    classes += "!bg-gray-100 cursor-not-allowed ";
                } else if (isSameDay(selectedDate, date)) {
                    classes += "!bg-blue-100 cursor-pointer hover:opacity-80 ";
                } else if (hasEvents.some((event) => event.type === "aprovado")) {
                    classes += "!bg-green-100 cursor-pointer hover:opacity-80 ";
                } else if (hasEvents.some((event) => event.type === "agendado")) {
                    classes += "!bg-amber-100 cursor-pointer hover:opacity-80 ";
                } else {
                    classes += "!bg-white cursor-pointer hover:opacity-80 ";
                }

                if (isToday) classes += "!border-2 !border-yellow-primary";

                return { className: classes };
            }}
            eventPropGetter={(event) => ({
                className:
                    event.type === "agendado"
                        ? "!bg-yellow-primary !text-black !text-[10px] font-bold border-none"
                        : "!bg-green-500 !text-white !text-[10px] font-bold border-rounded-xl",
            })}
            messages={{ next: ">", previous: "<", today: "Hoje" }}
        />
    );
}
