"use client";

import { useState } from "react";
import { events } from "@/src/infra/modules/student/presences-mock";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Calendar1, CalendarDays } from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { Button } from "../../../components/ui/button";
import EventSheet from "./event_sheet";

const locales = {
    "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function PresencePage() {
    const [allEvents, setAllEvents] = useState(events);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setIsSheetOpen(true);
    };

    const handleSituationChange = (eventId: string | number, newSituation: "pending" | "confirmed" | "absent") => {
        setAllEvents((prevEvents) =>
            prevEvents.map((event) => (event.id === eventId ? { ...event, situation: newSituation } : event))
        );
        if (selectedEvent?.id === eventId) {
            setSelectedEvent({ ...selectedEvent, situation: newSituation });
        }
    };

    const Toolbar = ({ date, onNavigate }: any) => {
        const month = format(date, "MMMM", { locale: ptBR });
        const year = format(date, "yyyy");

        return (
            <div className="flex justify-between items-start pt-2 pb-7">
                <div className="flex">
                    <CalendarDays />
                    <div>
                        <div>
                            <span className="capitalize font-semibold">{month}</span>
                            <span className="text-sm text-muted-foreground">{year}</span>
                        </div>
                        Calendário de Atividades
                    </div>
                </div>

                <div className="flex items-center gap-20">
                    <Button onClick={() => onNavigate("PREV")} variant="outline" className="cursor-pointer">
                        ‹
                    </Button>
                    <Button onClick={() => onNavigate("TODAY")} variant="outline" className="cursor-pointer">
                        Hoje
                    </Button>

                    <Button onClick={() => onNavigate("NEXT")} variant="outline" className="cursor-pointer">
                        ›
                    </Button>
                </div>
            </div>
        );
    };

    const MonthEvent = ({ event }: any) => {
        return <div className="px-2 py-0.5 rounded-md text-xs font-medium truncate text-black">{event.title}</div>;
    };

    const eventPropGetter = (event: any) => {
        const now = new Date();
        const eventDate = new Date(event.end);
        const isPast = eventDate < now;

        let backgroundColor = "#9ca3af"; // cinza padrão - aguardando confirmação

        if (event.situation === "confirmed") {
            backgroundColor = isPast ? "#16a34a" : "#eab308"; // verde se passou, amarelo se futuro
        } else if (event.situation === "absent") {
            backgroundColor = "#dc2626"; // vermelho - faltou (passado ou futuro)
        }

        return {
            style: {
                backgroundColor,
                color: "#FFFFFF",
                borderRadius: "6px",
                border: "none",
                padding: "3px 10px",
                width: "90%",
                margin: "auto",
            },
        };
    };

    return (
        <div className="flex size-full px-35 py-10 ">
            <div className="w-full h-full">
                <h1 className="text-3xl font-semibold">
                    Progamação do <span className="text-yellow-primary">Espaço 4.0</span>
                </h1>
                <p className=" mb-10 text-gray-600">Gerencie sua presença e acompanhe seus cursos</p>
                <div className="bg-white rounded-lg shadow-lg p-4 w-full">
                    <Calendar
                        localizer={localizer}
                        events={allEvents}
                        startAccessor="start"
                        endAccessor="end"
                        views={["month"]}
                        eventPropGetter={eventPropGetter}
                        culture="pt-BR"
                        className="presence-calendar h-170 w-full p-0"
                        style={{ height: 720, width: "100%" }}
                        components={{ toolbar: Toolbar, event: MonthEvent }}
                        onSelectEvent={handleSelectEvent}
                        messages={{
                            next: "Próximo",
                            previous: "Anterior",
                            today: "Hoje",
                            month: "Mês",
                            week: "Semana",
                            day: "Dia",
                            agenda: "Agenda",
                            date: "Data",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "Não há eventos neste período.",
                        }}
                        defaultView="month"
                    />
                </div>
                <div className="flex gap-2 mt-6 items-center">
                    <div className="bg-green-600 size-5 rounded-sm" />
                    Presença confirmada (evento passado)
                    <div className="ml-5 bg-yellow-500 size-5 rounded-sm" />
                    Presença confirmada (evento futuro)
                    <div className="ml-5 bg-red-600 size-5 rounded-sm" />
                    Ausência registrada
                    <div className="ml-5 bg-gray-400 size-5 rounded-sm" />
                    Aguardando confirmação
                    <div className="ml-5 bg-white border-yellow-primary border-2 size-5 rounded-sm" />
                    Hoje
                </div>

                <EventSheet
                    isOpen={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                    title={selectedEvent?.title || ""}
                    description={selectedEvent?.description || ""}
                    situation={selectedEvent?.situation || "pending"}
                    start={selectedEvent?.start}
                    date={selectedEvent?.start ? format(selectedEvent.start, "PPP", { locale: ptBR }) : ""}
                    instructor={selectedEvent?.instructor || ""}
                    location={selectedEvent?.location || ""}
                    observation={selectedEvent?.observation || ""}
                    eventId={selectedEvent?.id}
                    onSituationChange={handleSituationChange}
                />
            </div>
        </div>
    );
}
