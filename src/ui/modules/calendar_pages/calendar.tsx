"use client";

import React, { useState } from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { calendarEventsMock } from "@/src/infra/modules/calendar/calendar-mock";
import { EventDetail } from "@/src/ui/modules/calendar_pages/components/event-detail";
import { EventList } from "@/src/ui/modules/calendar_pages/components/event-list";
import { PanelWrapper } from "@/src/ui/modules/calendar_pages/components/panel-wrapper";
import { ErrorState, IdleState, LoadingState, SuccessState } from "@/src/ui/modules/calendar_pages/components/states";
import { BookingForm, CalendarFormInput } from "@/src/ui/modules/calendar_pages/forms/booking-form";
import { format, getDay, isSameDay, parse, setHours, setMinutes, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useForm } from "react-hook-form";

import "react-big-calendar/lib/css/react-big-calendar.css";

export const locales = { "pt-BR": ptBR };
export const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const monthMap: { [key: string]: number } = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
};

const MAX_STUDENTS = 30;
const MIN_EVENT_GAP_MINUTES = 30;

export default function AllCalendar() {
    const searchParams = useSearchParams();

    const getInitialState = () => {
        const day = searchParams.get("day");
        const month = searchParams.get("month");
        if (day && month && monthMap[month.toLowerCase()] !== undefined) {
            const target = new Date(2026, monthMap[month.toLowerCase()], Number.parseInt(day));
            return { date: target, step: "list" as const };
        }
        return { date: new Date(2026, 5, 1), step: "idle" as const };
    };

    const initialState = getInitialState();

    const [viewDate, setViewDate] = useState<Date>(initialState.date);
    const [selectedDate, setSelectedDate] = useState<Date>(initialState.date);
    const [step, setStep] = useState<"idle" | "list" | "form" | "detail" | "loading" | "success" | "error">(
        initialState.step
    );

    const [selectedEventId, setSelectedEventId] = useState<number>(0);
    const [events, setEvents] = useState<CalendarEvent[]>(calendarEventsMock);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const formMethods = useForm<CalendarFormInput>({
        defaultValues: {
            instituicao: "",
            professor: "",
            email: "",
            whatsapp: "",
            quantidade: "",
            hora: "09:00",
            horaSaida: "10:00",
            mensagem: "",
        },
    });

    const handleFormSubmit = (data: CalendarFormInput) => {
        setErrorMessage("");
        setStep("loading");

        setTimeout(() => {
            const quantidade = Number.parseInt(data.quantidade, 10);
            if (!Number.isFinite(quantidade) || quantidade <= 0) {
                setErrorMessage("Informe a quantidade de alunos.");
                setStep("error");
                return;
            }

            if (quantidade > MAX_STUDENTS) {
                setErrorMessage(`Máximo de ${MAX_STUDENTS} alunos.`);
                setStep("error");
                return;
            }

            const [sh, sm] = data.hora.split(":").map(Number);
            const [eh, em] = data.horaSaida.split(":").map(Number);
            const start = setMinutes(setHours(new Date(selectedDate), sh), sm);
            let end = setMinutes(setHours(new Date(selectedDate), eh), em);

            if (end <= start) end = setMinutes(setHours(new Date(selectedDate), eh + 1), em);

            const gapMs = MIN_EVENT_GAP_MINUTES * 60 * 1000;
            const hasConflict = events.some((event) => {
                if (!isSameDay(event.start, start)) return false;
                const startBoundary = new Date(event.start.getTime() - gapMs);
                const endBoundary = new Date(event.end.getTime() + gapMs);
                return start < endBoundary && end > startBoundary;
            });

            if (hasConflict) {
                setErrorMessage(`Intervalo mínimo de ${MIN_EVENT_GAP_MINUTES} minutos entre eventos.`);
                setStep("error");
            } else {
                const newEvent: CalendarEvent = {
                    id: Date.now(),
                    title: `Visita: ${data.instituicao}`,
                    start,
                    end,
                    type: "aprovado",
                    description: data.mensagem || "Solicitação de visita.",
                    time: `${data.hora} - ${data.horaSaida}`,
                    local: "Espaço 4.0",
                    professor: data.professor,
                    whatsapp: data.whatsapp,
                    quantidade: data.quantidade,
                };
                setEvents([...events, newEvent]);
                setStep("success");
                formMethods.reset();
            }
        }, 1500);
    };

    const activeEvent = events.find((e) => e.id === selectedEventId);
    const dayEvents = events.filter((e) => isSameDay(e.start, selectedDate));

    return (
        <section className="bg-gray-50 min-h-screen py-4 lg:py-6 2xl:py-8 px-2 lg:px-8 2xl:px-20 font-sans">
            <div className="max-w-full lg:max-w-6xl 2xl:max-w-7xl mx-auto">
                <div className="text-yellow-muted p-1 lg:p-2 pb-3 lg:pb-4 flex items-center gap-1 text-xs font-medium">
                    <Link href="/" className="text-gray-400 hover:underline flex gap-1">
                        <Home className="h-3 w-3" />
                        Home
                    </Link>
                    <ChevronRight size={12} className="text-gray-400" /> <span>Calendário Espaço 4.0</span>
                </div>

                <header className="mb-3 lg:mb-4 2xl:mb-6 px-1 lg:px-0">
                    <h2 className="text-lg lg:text-2xl 2xl:text-3xl font-semibold text-gray-800 tracking-tight">
                        Programação do <span className="text-yellow-primary">Espaço 4.0</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 2xl:gap-6 items-start">
                    <div className="lg:col-span-7 2xl:col-span-8 bg-white border rounded-lg lg:rounded-xl p-2 lg:p-3 2xl:p-4 shadow-sm">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            date={viewDate}
                            onNavigate={setViewDate}
                            selectable
                            onSelectSlot={(slot) => {
                                setSelectedDate(slot.start);
                                setStep(events.some((e) => isSameDay(e.start, slot.start)) ? "list" : "form");
                            }}
                            onSelectEvent={(ev) => {
                                setSelectedDate(ev.start);
                                setStep("list");
                            }}
                            style={{ height: 520 }}
                            className="calendar-mobile"
                            culture="pt-BR"
                            views={["month"]}
                            dayPropGetter={(date) => {
                                const hasEv = events.filter((e) => isSameDay(e.start, date));
                                let cls = "transition-all cursor-pointer hover:opacity-80 ";
                                if (hasEv.some((e) => e.type === "aprovado")) cls += "!bg-green-50";
                                else if (isSameDay(selectedDate, date)) cls += "!bg-blue-50";
                                else if (hasEv.some((e) => e.type === "agendado")) cls += "!bg-amber-50";
                                return { className: cls };
                            }}
                            eventPropGetter={(ev) => ({
                                className:
                                    ev.type === "agendado"
                                        ? "!bg-yellow-primary !text-black !text-[10px] font-bold border-none"
                                        : "!bg-green-500 !text-white !text-[10px] font-bold border-none",
                            })}
                            messages={{ next: ">", previous: "<", today: "Hoje" }}
                        />
                    </div>

                    <aside className="lg:col-span-4 min-h-130">
                        <PanelWrapper
                            align={step === "list" || step === "form" || step === "detail" ? "start" : "center"}
                        >
                            {step === "idle" && <IdleState />}
                            {step === "list" && (
                                <EventList
                                    date={selectedDate}
                                    events={dayEvents}
                                    onAdd={() => setStep("form")}
                                    onSelect={(id) => {
                                        setSelectedEventId(id);
                                        setStep("detail");
                                    }}
                                    onClose={() => setStep("idle")}
                                />
                            )}
                            {step === "form" && (
                                <BookingForm
                                    methods={formMethods}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setStep("idle")}
                                    maxStudents={MAX_STUDENTS}
                                />
                            )}
                            {step === "detail" && activeEvent && (
                                <EventDetail
                                    event={activeEvent}
                                    onBack={() => setStep("list")}
                                    onClose={() => setStep("idle")}
                                />
                            )}
                            {step === "loading" && <LoadingState />}
                            {step === "success" && (
                                <SuccessState
                                    onBack={() => {
                                        setStep("idle");
                                        formMethods.reset();
                                    }}
                                />
                            )}
                            {step === "error" && (
                                <ErrorState
                                    message={errorMessage}
                                    onBack={() => {
                                        setErrorMessage("");
                                        setStep("form");
                                    }}
                                />
                            )}
                        </PanelWrapper>
                    </aside>

                    <div className="col-span-1 lg:col-span-12 flex flex-wrap items-center justify-start gap-6  border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-primary ring-2 ring-yellow-100" />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                                Solicitação Concluída
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-100" />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                                Solicitação Em Análise
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-100" />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                                Solicitação Recusada
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
