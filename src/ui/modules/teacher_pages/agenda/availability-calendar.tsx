"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button } from "@/src/ui/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VisitAvailability } from "@/src/ui/lib/visit-requests-api";
import { DateRuleModal } from "./date-rule-modal";
import { toast } from "sonner";
import { buildHolidayMap } from "@/src/lib/visits/holiday-utils";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type ToolbarProps = {
    date: Date;
    onNavigate: (action: "PREV" | "TODAY" | "NEXT") => void;
};

function Toolbar({ date, onNavigate }: ToolbarProps) {
    const month = format(date, "MMMM", { locale: ptBR });
    const year = format(date, "yyyy");

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4 pt-1 gap-3">
            <div>
                <div className="flex gap-1 items-center font-medium text-base">
                    <span className="capitalize text-gray-800 font-bold">
                        {month}, {year}
                    </span>
                </div>
                <span className="text-xs text-gray-500">Configurando Disponibilidade das Datas</span>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button
                    onClick={() => onNavigate("PREV")}
                    variant="outline"
                    className="h-9 px-3 cursor-pointer"
                    type="button"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <Button
                    onClick={() => onNavigate("TODAY")}
                    className="bg-yellow-primary hover:bg-yellow-secondary text-black h-9 cursor-pointer text-sm font-semibold"
                    type="button"
                >
                    Hoje
                </Button>
                <Button
                    onClick={() => onNavigate("NEXT")}
                    variant="outline"
                    className="h-9 px-3 cursor-pointer"
                    type="button"
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}

interface AvailabilityCalendarProps {
    availability: VisitAvailability;
    onRefresh: () => void;
}

export function AvailabilityCalendar({ availability, onRefresh }: AvailabilityCalendarProps) {
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [existingRule, setExistingRule] = useState<{ isAvailable: boolean; reason: string | null } | null>(null);
    const [defaultIsAvailable, setDefaultIsAvailable] = useState<boolean>(true);

    const getDateStatus = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");

        const dateRule = availability.dateRules.find((r) => r.date === dateStr);
        if (dateRule) {
            return {
                isOverride: true,
                isAvailable: dateRule.isAvailable,
                reason: dateRule.reason,
                rule: dateRule,
            };
        }

        const holidayMap = buildHolidayMap(date.getFullYear());
        const holidayName = holidayMap.get(dateStr);
        if (holidayName) {
            return {
                isOverride: false,
                isAvailable: false,
                reason: holidayName,
                rule: null,
            };
        }

        const dayOfWeek = date.getDay();
        const weekdayRule = availability.weekdayRules.find((r) => r.dayOfWeek === dayOfWeek);
        
        return {
            isOverride: false,
            isAvailable: weekdayRule ? weekdayRule.isAvailable : (dayOfWeek !== 0 && dayOfWeek !== 6),
            reason: null,
            rule: null,
        };
    };

    const getBaseAvailability = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        
        const holidayMap = buildHolidayMap(date.getFullYear());
        if (holidayMap.has(dateStr)) {
            return false;
        }
        
        const dayOfWeek = date.getDay();
        const weekdayRule = availability.weekdayRules.find((r) => r.dayOfWeek === dayOfWeek);
        if (weekdayRule) {
            return weekdayRule.isAvailable;
        }
        
        return dayOfWeek !== 0 && dayOfWeek !== 6;
    };

    const customDateEvents = availability.dateRules.map((rule) => {
        const parsedDate = new Date(`${rule.date}T00:00:00`);
        return {
            id: rule.id,
            title: rule.isAvailable 
                ? "✓ Liberado (Exceção)" 
                : `✗ Bloqueado: ${rule.reason || "Sem justificativa"}`,
            start: parsedDate,
            end: parsedDate,
            allDay: true,
            isAvailable: rule.isAvailable,
            isOverride: true,
            reason: rule.reason,
        };
    });

    const holidayMap = buildHolidayMap(new Date().getFullYear());
    const holidayEvents = Array.from(holidayMap.entries()).map(([dateStr, name]) => {
        const parsedDate = new Date(`${dateStr}T00:00:00`);
        return {
            id: `holiday-${dateStr}`,
            title: `🎉 Feriado: ${name}`,
            start: parsedDate,
            end: parsedDate,
            allDay: true,
            isAvailable: false,
            isOverride: false,
            isHoliday: true,
            reason: name,
        };
    });

    const calendarEvents = [...customDateEvents, ...holidayEvents];

    const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: "select" | "click" | "doubleClick" }) => {
        const start = new Date(slotInfo.start);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(slotInfo.end);
        end.setHours(0, 0, 0, 0);
        
        const diffMs = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            toast.error("Para configurar um período, utilize a seção 'Período Especial' na barra lateral.");
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            toast.error("Não é possível alterar a disponibilidade de dias passados.");
            return;
        }

        setSelectedDates([start]);

        const status = getDateStatus(start);
        setDefaultIsAvailable(getBaseAvailability(start));
        if (status.isOverride && status.rule) {
            setExistingRule({ isAvailable: status.rule.isAvailable, reason: status.rule.reason });
        } else {
            setExistingRule(null);
        }

        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                date={viewDate}
                onNavigate={setViewDate}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => {
                    const eventDate = new Date(event.start);
                    eventDate.setHours(0, 0, 0, 0);
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (eventDate < today) {
                        toast.error("Não é possível alterar a disponibilidade de dias passados.");
                        return;
                    }

                    if ((event as any).isHoliday) {
                        const dayOfWeek = eventDate.getDay();
                        if (dayOfWeek === 0 || dayOfWeek === 6) {
                            toast.error("Feriados em finais de semana não são passíveis de liberação.");
                            return;
                        }
                        
                        setSelectedDates([eventDate]);
                        const status = getDateStatus(eventDate);
                        if (status.isOverride && status.rule) {
                            setExistingRule({ isAvailable: status.rule.isAvailable, reason: status.rule.reason });
                        } else {
                            setExistingRule(null);
                        }
                        setDefaultIsAvailable(false); // Feriados são indisponíveis por padrão
                        setIsModalOpen(true);
                        return;
                    }
                    
                    setSelectedDates([eventDate]);
                    setExistingRule({ isAvailable: event.isAvailable, reason: event.reason });
                    setDefaultIsAvailable(getBaseAvailability(eventDate));
                    setIsModalOpen(true);
                }}
                style={{ height: 560 }}
                culture="pt-BR"
                views={["month"]}
                components={{ toolbar: Toolbar }}
                dayPropGetter={(date) => {
                    const status = getDateStatus(date);
                    const isTodayDate = isSameDay(date, new Date());
                    
                    let classes = "transition-all cursor-pointer ";

                    if (status.isAvailable) {
                        classes += "!bg-green-50/50 hover:!bg-green-100/50 text-green-900 border-green-100 ";
                    } else {
                        classes += "!bg-red-50/20 hover:!bg-red-50/40 text-red-900 border-red-100 ";
                    }

                    if (isTodayDate) {
                        classes += "!border-2 !border-yellow-primary ";
                    }

                    return {
                        className: classes,
                    };
                }}
                eventPropGetter={(event) => {
                    if ((event as any).isHoliday) {
                        return {
                            className: "!bg-pink-600 !text-white !text-[11px] font-semibold border-none rounded-md px-1 shadow-sm truncate",
                        };
                    }
                    return {
                        className: event.isAvailable
                            ? "!bg-green-600 !text-white !text-[11px] font-semibold border-none rounded-md px-1 shadow-sm truncate"
                            : "!bg-red-600 !text-white !text-[11px] font-semibold border-none rounded-md px-1 shadow-sm truncate",
                    };
                }}
                messages={{ next: ">", previous: "<", today: "Hoje" }}
            />

            <div className="flex flex-wrap items-center gap-6 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-green-50 border border-green-200 size-4 rounded-sm" />
                    <span className="text-xs text-gray-700 font-medium">Dias Disponíveis</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-red-50/20 border border-red-100 size-4 rounded-sm" />
                    <span className="text-xs text-gray-700 font-medium">Dias Bloqueados</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-pink-600 border border-pink-700 size-4 rounded-sm" />
                    <span className="text-xs text-gray-700 font-medium">Feriados</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white border-yellow-primary border-2 size-4 rounded-sm" />
                    <span className="text-xs text-gray-700 font-medium">Hoje</span>
                </div>
                <div className="text-xs text-gray-500 italic ml-auto">
                    * Clique em um dia para configurar regras específicas.
                </div>
            </div>

            <DateRuleModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDates={selectedDates}
                existingRule={existingRule}
                defaultIsAvailable={defaultIsAvailable}
                onSaved={onRefresh}
            />
        </div>
    );
}
