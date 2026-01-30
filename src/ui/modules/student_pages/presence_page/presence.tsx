import { useCallback, useState } from "react";
import { events } from "@/src/infra/modules/student/presences-mock";
import { Button } from "@/src/ui/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "react-big-calendar";

import { localizer } from "../../calendar_pages/calendar";
import EventSheet from "./event_sheet";

interface ToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "TODAY" | "NEXT") => void;
}

const Toolbar = ({ date, onNavigate }: ToolbarProps) => {
    const month = format(date, "MMMM", { locale: ptBR });
    const year = format(date, "yyyy");

    const handlePrev = useCallback(() => {
        if (typeof onNavigate === "function") {
            onNavigate("PREV");
        }
    }, [onNavigate]);

    const handleToday = useCallback(() => {
        if (typeof onNavigate === "function") {
            onNavigate("TODAY");
        }
    }, [onNavigate]);

    const handleNext = useCallback(() => {
        if (typeof onNavigate === "function") {
            onNavigate("NEXT");
        }
    }, [onNavigate]);

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-2 pb-4 lg:pb-6 pt-1 gap-3 lg:gap-0">
            <div className="flex gap-2 lg:gap-4 items-center">
                <CalendarDays className="bg-yellow-primary text-black size-9 lg:size-11 p-2 rounded-lg" />
                <div>
                    <div className="flex gap-1 items-center font-medium text-sm lg:text-base">
                        <span className="capitalize">
                            {month}, {year}
                        </span>
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600">Calendário de Atividades</span>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
                <Button
                    onClick={handlePrev}
                    variant="outline"
                    className="h-9 lg:h-10 cursor-pointer px-2 lg:px-4"
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
};

const MonthEvent = ({ event }: any) => {
    return <div className="px-2 py-0.5 rounded-md text-xs font-medium text-white">{event.title}</div>;
};

const eventPropGetter = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.end);
    const isPast = eventDate < now;

    let backgroundColor = "#9ca3af";
    if (event.situation === "confirmed") {
        backgroundColor = isPast ? "#16a34a" : "#eab308";
    } else if (event.situation === "absent") {
        backgroundColor = "#dc2626";
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

export default function PresencePage() {
    const [allEvents, setAllEvents] = useState(events);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setIsSheetOpen(true);
    };

    // Isso ai serve pra mudar a situação de um evento e é usado lá no "event_sheet"
    const handleSituationChange = (eventId: string | number, newSituation: "pending" | "confirmed" | "absent") => {
        setAllEvents((prevEvents) =>
            prevEvents.map((event) => (event.id === eventId ? { ...event, situation: newSituation } : event))
        );
        if (selectedEvent?.id === eventId) {
            setSelectedEvent({ ...selectedEvent, situation: newSituation });
        }
    };

    return (
        <div className="px-4 lg:px-8 2xl:px-15 w-full h-full">
            <div className="bg-white rounded-lg lg:rounded-xl 2xl:rounded-lg shadow-lg p-4 lg:p-5 2xl:p-4 hover:shadow-xl transition-shadow duration-300">
                <Calendar
                    localizer={localizer}
                    events={allEvents}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month"]}
                    eventPropGetter={eventPropGetter}
                    culture="pt-BR"
                    className="presence-calendar h-170 border-b"
                    style={{ height: "clamp(450px, 60vh, 710px)", width: "100%" }}
                    components={{ toolbar: Toolbar, event: MonthEvent }}
                    formats={{
                        weekdayFormat: (date) =>
                            format(date, "EEE", { locale: ptBR }).replace(".", "").toUpperCase().slice(0, 3),
                    }}
                    onSelectEvent={handleSelectEvent}
                    defaultView="month"
                />

                <div className="flex flex-col lg:flex-row flex-wrap justify-center items-start lg:items-center gap-4 lg:gap-6 2xl:gap-7 mt-6 lg:mt-7 2xl:mt-8 mb-3 px-2 py-2  rounded-lg ">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-green-600 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                        <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                            Presença confirmada (evento passado)
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-yellow-500 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                        <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                            Presença confirmada (evento futuro)
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-red-600 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                        <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                            Ausência registrada
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gray-400 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                        <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">
                            Aguardando confirmação
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-white border-yellow-primary border-2 size-4 lg:size-4.5 2xl:size-5 rounded-sm shadow-sm" />
                        <span className="text-xs lg:text-sm 2xl:text-sm text-gray-700 font-medium">Hoje</span>
                    </div>
                </div>
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
    );
}
