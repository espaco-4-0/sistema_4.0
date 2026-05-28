"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { Button } from "@/src/ui/components/ui/button";
import { format, getDay, isSameDay, isSameMonth, isToday, isWeekend, parse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { VisitAvailability } from "@/src/ui/lib/visit-requests-api";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type ToolbarProps = {
    date: Date;
    onNavigate: (action: "PREV" | "TODAY" | "NEXT") => void;
};

function Toolbar({ date, onNavigate }: ToolbarProps) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const today = new Date();
    const month = format(date, "MMMM", { locale: ptBR });
    const year = format(date, "yyyy");

    const isCurrentMonth = mounted ? isSameMonth(date, today) : false;

    const maxYear = 2026;
    const isMaxDate = mounted ? (date.getFullYear() >= maxYear && date.getMonth() === 11) : false;

    const handlePrev = useCallback(() => {
        if (!isCurrentMonth) onNavigate("PREV");
    }, [onNavigate, isCurrentMonth]);

    const handleToday = useCallback(() => onNavigate("TODAY"), [onNavigate]);

    const handleNext = useCallback(() => {
        if (!isMaxDate) onNavigate("NEXT");
    }, [onNavigate, isMaxDate]);

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
                    disabled={isMaxDate}
                    className={`h-9 lg:h-10 px-2 lg:px-4 ${isMaxDate ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
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
    availability?: VisitAvailability;
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
    availability,
}: UnifiedVisitCalendarProps) {
    return (
        <Calendar
            localizer={localizer}
            events={events}
            date={viewDate}
            onNavigate={onViewDateChange}
            selectable
            onSelectSlot={(slot) => {
                onSelectDay(slot.start);
            }}
            onSelectEvent={(event) => {
                if ((event as any).isHoliday) {
                    return; // Não faz nada ao clicar no feriado
                }
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
                const isTodayDay = isToday(date);
                const isPastDay = date < new Date(new Date().setHours(0, 0, 0, 0));

                const holidayEvent = hasEvents.find((ev) => (ev as any).isHoliday);
                const isHolidayDay = Boolean(holidayEvent);

                let isAvailable = true;
                let isBlockedOverride = false;

                if (isPastDay) {
                    isAvailable = false;
                } else if (availability) {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const dateOverride = availability.dateRules.find((r) => r.date === dateStr);
                    if (dateOverride) {
                        isAvailable = dateOverride.isAvailable;
                        isBlockedOverride = !dateOverride.isAvailable;
                    } else if (isHolidayDay) {
                        isAvailable = false;
                    } else {
                        const dayOfWeek = date.getDay();
                        const weekdayRule = availability.weekdayRules.find((r) => r.dayOfWeek === dayOfWeek);
                        if (weekdayRule) {
                            isAvailable = weekdayRule.isAvailable;
                        } else {
                            isAvailable = dayOfWeek !== 0 && dayOfWeek !== 6;
                        }
                    }
                } else {
                    const isWeekendDay = isWeekend(date);
                    isAvailable = !isPastDay && !isWeekendDay && !isHolidayDay;
                }

                let classes = "transition-all ";

                if (isHolidayDay) {
                    classes += "!bg-pink-50 text-pink-800 cursor-not-allowed ";
                } else if (!isAvailable) {
                    if (isBlockedOverride) {
                        classes += "!bg-red-50/40 text-red-800 border-l-2 border-red-300 cursor-not-allowed ";
                    } else {
                        classes += "!bg-gray-100 cursor-not-allowed ";
                    }
                } else if (isSameDay(selectedDate, date)) {
                    classes += "!bg-blue-100 cursor-pointer hover:opacity-80 ";
                } else if (hasEvents.some((event) => event.type === "aprovado")) {
                    classes += "!bg-green-100 cursor-pointer hover:opacity-80 ";
                } else if (hasEvents.some((event) => event.type === "agendado")) {
                    classes += "!bg-amber-100 cursor-pointer hover:opacity-80 ";
                } else {
                    classes += "!bg-white cursor-pointer hover:opacity-80 ";
                }

                if (isTodayDay) classes += "!border-2 !border-yellow-primary";

                let titleAttr = undefined;
                if (isHolidayDay) {
                    titleAttr = (holidayEvent as any)?.holidayName ?? "Feriado";
                } else if (isBlockedOverride && availability) {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const dateOverride = availability.dateRules.find((r) => r.date === dateStr);
                    if (dateOverride?.reason) titleAttr = dateOverride.reason;
                }

                return {
                    className: classes,
                    style: {},
                    ...(titleAttr ? { title: titleAttr } : {}),
                };
            }}

            eventPropGetter={(event) => {
                const isHoliday = (event as any).isHoliday || (event as any).type === "holiday";
                if (isHoliday) {
                    return {
                        className: "!bg-pink-400 !text-white !text-[10px] font-bold border-none rounded-md px-1",
                    };
                }
                return {
                    className:
                        event.type === "agendado"
                            ? "!bg-yellow-primary !text-black !text-[10px] font-bold border-none rounded-md px-1"
                            : "!bg-green-500 !text-white !text-[10px] font-bold border-none rounded-md px-1",
                };
            }}
            messages={{ next: ">", previous: "<", today: "Hoje" }}
        />
    );
}
