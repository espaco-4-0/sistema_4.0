"use client";

import React, { useCallback, useEffect, useState } from "react";
import { calendarEventsMock, type CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { getPublicVisitEvents, publicVisitToCalendarEvent, submitVisitRequest } from "@/src/ui/lib/visit-requests-api";
import { EventDetail } from "@/src/ui/modules/appointments_pages/components/event-detail";
import { EventList } from "@/src/ui/modules/appointments_pages/components/event-list";
import { PanelWrapper } from "@/src/ui/modules/appointments_pages/components/panel-wrapper";
import { UnifiedVisitCalendar } from "@/src/ui/modules/appointments_pages/components/shared/unified-visit-calendar";
import {
    ErrorState,
    IdleState,
    LoadingState,
    SuccessState,
} from "@/src/ui/modules/appointments_pages/components/states";
import { BookingForm, CalendarFormInput } from "@/src/ui/modules/appointments_pages/forms/booking-form";
import { format, isSameDay, setHours, setMinutes } from "date-fns";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import "react-big-calendar/lib/css/react-big-calendar.css";

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

const MAX_STUDENTS_PER_THURM = 30;
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
    const [events, setEvents] = useState<CalendarEvent[]>([]);
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
            anexos: null,
            confirmacaoDocumentos: false,
            mensagem: "",
        },
    });

    // Carrega eventos do banco via API + mock estático
    useEffect(() => {
        async function loadEvents() {
            const visitEvents = await getPublicVisitEvents();
            const converted = visitEvents.filter((v) => v.status !== "negado").map(publicVisitToCalendarEvent);
            setEvents([...calendarEventsMock, ...converted]);
        }
        loadEvents();
    }, []);

    const handleFormSubmit = async (data: CalendarFormInput) => {
        setErrorMessage("");
        setStep("loading");

        // Validações locais
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
            return;
        }

        try {
            const formData = new FormData();
            formData.append("instituicao", data.instituicao);
            formData.append("responsavel", data.professor);
            formData.append("email", data.email);
            formData.append("whatsapp", data.whatsapp);
            formData.append("quantidade", data.quantidade);
            formData.append("dataVisita", format(selectedDate, "yyyy-MM-dd"));
            formData.append("horaInicio", data.hora);
            formData.append("horaFim", data.horaSaida);
            if (data.mensagem) formData.append("mensagem", data.mensagem);
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
            setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
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
                    <ChevronRight size={12} className="text-gray-400" />{" "}
                    <span>Calendário de Visitas do Espaço 4.0</span>
                </div>

                <header className="mb-3 lg:mb-4 2xl:mb-6 px-1 lg:px-0">
                    <h2 className="text-lg lg:text-2xl 2xl:text-3xl font-semibold text-gray-800 tracking-tight">
                        Programação do <span className="text-yellow-primary">Espaço 4.0</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 2xl:gap-6 items-start">
                    <div className="lg:col-span-7 2xl:col-span-8 bg-white rounded-lg lg:rounded-xl 2xl:rounded-lg shadow-lg p-4 lg:p-5 2xl:p-4 hover:shadow-xl transition-shadow duration-300">
                        <UnifiedVisitCalendar
                            events={events}
                            selectedDate={selectedDate}
                            viewDate={viewDate}
                            onViewDateChange={setViewDate}
                            onSelectDay={(date) => {
                                setSelectedDate(date);
                                setStep(events.some((event) => isSameDay(event.start, date)) ? "list" : "form");
                            }}
                            onSelectEvent={() => {
                                setStep("list");
                            }}
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
                                    maxStudents={MAX_STUDENTS_PER_THURM}
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

                    <div className="col-span-1 lg:col-span-12 flex flex-col lg:flex-row flex-wrap items-start lg:items-center gap-4 lg:gap-6 2xl:gap-7 mt-6 lg:mt-7 2xl:mt-8 mb-3 px-2 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="bg-yellow-primary size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                            <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                                Evento pendente (aguarde atualizações)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-red-500 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                            <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                                Evento recusado
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                            <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                                Evento aprovado (agendado no calendário)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white border-yellow-primary border-2 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                            <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">Hoje</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
