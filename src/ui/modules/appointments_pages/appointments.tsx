"use client";

import React, { useEffect, useState } from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { getPublicVisitEvents, publicVisitToCalendarEvent, submitVisitRequest } from "@/src/ui/lib/visit-requests-api";
import { EventDetail } from "@/src/ui/modules/appointments_pages/components/event-detail";
import { EventList } from "@/src/ui/modules/appointments_pages/components/event-list";
import { PanelWrapper } from "@/src/ui/modules/appointments_pages/components/panel-wrapper";
import { UnifiedVisitCalendar } from "@/src/ui/modules/appointments_pages/components/shared/unified-visit-calendar";
import {
    ErrorState,
    IdleState,
    LoadingState,
    PastState,
    SuccessState,
    WeekendState,
} from "@/src/ui/modules/appointments_pages/components/states";
import { useInitialVisitState } from "@/src/ui/modules/appointments_pages/constants";
import { BookingForm } from "@/src/ui/modules/appointments_pages/forms/booking-form";
import { format, isSameDay } from "date-fns";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { getLocais } from "@/src/lib/locais-api";
import { buildHolidayMap, getHolidayNameSafe } from "@/src/lib/visits/holiday-utils";

import { CalendarFormInput } from "./forms/types";

const MAX_STUDENTS_PER_THURM = 30;

export default function AllCalendar() {
    const initialState = useInitialVisitState();

    const [viewDate, setViewDate] = useState<Date>(initialState.date);
    const [selectedDate, setSelectedDate] = useState<Date>(initialState.date);
    const [step, setStep] = useState(initialState.step);
    const [selectedEventId, setSelectedEventId] = useState<string | number>(0);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [holidayName, setHolidayName] = useState<string>("");

    const formMethods = useForm<CalendarFormInput>({
        defaultValues: {
            instituicao: "",
            professor: "",
            email: "",
            whatsapp: "",
            quantidade: "",
            hora: "09:00",
            horaSaida: "10:00",
            anexos: null,
            confirmacaoDocumentos: false,
            mensagem: "",
            paradas: [],
        },
    });

    useEffect(() => {
        async function loadEvents() {
            try {
                const visitEvents = await getPublicVisitEvents();
                const converted = visitEvents.filter((v) => v.status !== "negado").map(publicVisitToCalendarEvent);

                // Gerar feriados como eventos para o calendário
                const currentYear = new Date().getFullYear();
                const holidayMap = buildHolidayMap(currentYear);
                const holidayEvents: CalendarEvent[] = Array.from(holidayMap.entries()).map(([dateStr, name]) => {
                    const date = new Date(dateStr + "T00:00:00");
                    return {
                        id: Math.random(),
                        title: name,
                        start: date,
                        end: date,
                        allDay: true,
                        type: "holiday",
                        isHoliday: true,
                        holidayName: name,
                    } as any;
                });

                setEvents([...converted, ...holidayEvents]);
            } catch (err) {
                console.error("Erro ao carregar eventos:", err);
            }
        }
        loadEvents();
    }, []);

    const handleFormSubmit = async (data: CalendarFormInput) => {
        setErrorMessage("");
        setStep("loading");

        // Validações básicas
        const quantidade = Number.parseInt(data.quantidade, 10);
        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            setErrorMessage("Informe a quantidade de alunos.");
            setStep("error");
            return;
        }
        if (quantidade > MAX_STUDENTS_PER_THURM) {
            setErrorMessage(`Máximo de ${MAX_STUDENTS_PER_THURM} alunos.`);
            setStep("error");
            return;
        }

        const anexos = data.anexos ? Array.from(data.anexos) : [];
        if (anexos.length === 0) {
            setErrorMessage("Anexe pelo menos 1 documento na aba de documentação.");
            setStep("error");
            return;
        }
        if (!data.confirmacaoDocumentos) {
            setErrorMessage("Confirme a documentação antes de enviar o pedido.");
            setStep("error");
            return;
        }

        try {
            let totalMinutes = 0;
            if (data.paradas && data.paradas.length > 0) {
                const locaisCadastrados = await getLocais(false);
                totalMinutes = data.paradas.reduce((acc: number, id: string) => {
                    const loc = locaisCadastrados.find((l) => l.id === id);
                    return acc + (loc?.duracaoMin ?? 0);
                }, 0);
            }

            const formData = new FormData();
            formData.append("instituicao", data.instituicao);
            formData.append("responsavel", data.professor);
            formData.append("email", data.email);
            formData.append("whatsapp", data.whatsapp);
            formData.append("quantidade", String(quantidade));
            formData.append("dataVisita", format(selectedDate, "yyyy-MM-dd"));

            formData.append("horaInicio", data.hora);
            formData.append("horaFim", data.horaSaida);

            if (data.mensagem) formData.append("mensagem", data.mensagem);

            if (data.paradas && data.paradas.length > 0) {
                formData.append("paradas", JSON.stringify(data.paradas));
                formData.append("totalMinutes", String(totalMinutes));
            }

            for (const file of anexos) {
                formData.append("anexos", file);
            }

            const result = await submitVisitRequest(formData);

            const newEvent = publicVisitToCalendarEvent({
                id: result.id,
                instituicao: result.instituicao,
                dataVisita: result.dataVisita,
                horaInicio: result.horaInicio,
                horaFim: result.horaFim,
                status: result.status,
            });

            setEvents((prev) => [...prev, newEvent]);
            setStep("success");
            formMethods.reset();
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Erro ao processar solicitação.");
            setStep("error");
        }
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
                    <ChevronRight size={12} className="text-gray-400" />
                    <span>Calendário de Visitas do Espaço 4.0</span>
                </div>

                <header className="mb-3 lg:mb-4 2xl:mb-6 px-1 lg:px-0">
                    <h2 className="text-lg lg:text-2xl 2xl:text-3xl font-semibold text-gray-800 tracking-tight">
                        Programação do <span className="text-yellow-500">Espaço 4.0</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 2xl:gap-6 items-start">
                    <div className="lg:col-span-7 2xl:col-span-8 bg-white rounded-lg shadow-lg p-4 lg:p-5 hover:shadow-xl transition-shadow duration-300">
                        <UnifiedVisitCalendar
                            events={events}
                            selectedDate={selectedDate}
                            viewDate={viewDate}
                            onViewDateChange={setViewDate}
                            onSelectDay={(date) => {
                                setSelectedDate(date);

                                const todayStart = new Date();
                                todayStart.setHours(0, 0, 0, 0);
                                const isPast = date < todayStart;

                                const holiday = getHolidayNameSafe(date);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                if (isWeekend) {
                                    setStep("weekend");
                                    return;
                                }
                                if (isPast) {
                                    setStep("past");
                                    return;
                                }
                                if (holiday) {
                                    setHolidayName(holiday);
                                    setStep("holiday");
                                    return;
                                }

                                setStep(events.some((e) => isSameDay(e.start, date)) ? "list" : "form");
                            }}
                            onSelectEvent={() => setStep("list")}
                        />
                    </div>

                    <aside className="lg:col-span-4 min-h-[500px]">
                        <PanelWrapper align={["list", "form", "detail"].includes(step) ? "start" : "center"}>
                            {step === "idle" && <IdleState />}
                            {step === "weekend" && <WeekendState target={selectedDate} />}
                            {step === "past" && <PastState date={selectedDate} />}

                            {step === "holiday" && (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Feriado!</h3>
                                    <p className="text-gray-500 text-sm">
                                        A data selecionada é feriado de <strong>{holidayName}</strong>. O Espaço 4.0 não
                                        recebe visitas em feriados. Por favor, selecione outra data.
                                    </p>
                                    <button
                                        onClick={() => setStep("idle")}
                                        className="mt-6 text-yellow-600 hover:text-yellow-700 font-medium underline text-sm transition-colors"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            )}

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
                                    maxStudents={MAX_STUDENTS_PER_THURM}
                                    selectedDate={selectedDate}
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
                            {step === "error" && <ErrorState message={errorMessage} onBack={() => setStep("form")} />}
                        </PanelWrapper>
                    </aside>

                    <div className="col-span-1 lg:col-span-12 flex flex-col lg:flex-row flex-wrap items-start lg:items-center gap-4 lg:gap-6 mt-6 px-2">
                        <LegendItem color="bg-pink-400" text="Feriado" />
                        <LegendItem color="bg-yellow-primary" text="Evento pendente" />
                        <LegendItem color="bg-red-500" text="Evento recusado" />
                        <LegendItem color="bg-green-500" text="Evento aprovado" />
                        <div className="flex items-center gap-2">
                            <div className="bg-white border-yellow-primary border-2 size-4 rounded-sm" />
                            <span className="text-xs lg:text-sm text-gray-700 font-medium">Hoje</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LegendItem({ color, text }: { color: string; text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`${color} size-4 rounded-sm shadow-sm`} />
            <span className="text-xs lg:text-sm text-gray-700 font-medium">{text}</span>
        </div>
    );
}
