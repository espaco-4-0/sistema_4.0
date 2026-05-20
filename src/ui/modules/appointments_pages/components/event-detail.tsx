import React from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { ArrowLeft, Clock, MapPin, Phone, Users } from "lucide-react";

export const EventDetail = ({
    event,
    onBack,
    onClose,
}: {
    event: CalendarEvent;
    onBack: () => void;
    onClose: () => void;
}) => (
    <>
        <button
            onClick={onBack}
            className="text-[10px] font-bold text-gray-400 mb-4 flex items-center gap-1 uppercase hover:text-black"
        >
            <ArrowLeft size={12} /> Voltar
        </button>
        <div className="w-full">
            <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${event.type === "agendado" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
            >
                {event.type === "agendado" ? "Workshop" : "Visita Técnica"}
            </span>
            <h3 className="text-base font-bold text-gray-800 mt-2 mb-1">{event.title}</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{event.description}</p>
            <div className="space-y-2.5 border-t pt-4">
                <InfoRow icon={<Clock size={14} />} text={event.time || ""} />
                <InfoRow icon={<MapPin size={14} />} text={event.local || ""} />
                {event.quantidade && <InfoRow icon={<Users size={14} />} text={`${event.quantidade} pessoas`} />}
                {event.whatsapp && <InfoRow icon={<Phone size={14} />} text={event.whatsapp} />}
            </div>
        </div>
        <button
            onClick={onClose}
            className="mt-auto w-full bg-gray-50 text-gray-400 font-bold py-2 rounded-md text-[10px] uppercase hover:bg-gray-100"
        >
            Fechar
        </button>
    </>
);

const InfoRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
        <span className="text-yellow-icon">{icon}</span> {text}
    </div>
);
