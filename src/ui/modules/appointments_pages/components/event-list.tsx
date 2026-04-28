import React from "react";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { format } from "date-fns";
import { Clock, Plus } from "lucide-react";

export const EventList = ({
    date,
    events,
    onAdd,
    onSelect,
    onClose,
}: {
    date: Date;
    events: CalendarEvent[];
    onAdd: () => void;
    onSelect: (id: number) => void;
    onClose: () => void;
}) => (
    <>
        <div className="flex items-center justify-between w-full mb-4 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase">{format(date, "dd/MM/yyyy")}</h3>
            <button onClick={onAdd} className="p-1.5 bg-yellow-secondary hover:bg-yellow-secondary-dark rounded-full">
                <Plus size={16} className="text-black hover:cursor-pointer" />
            </button>
        </div>
        <div className="w-full space-y-2 overflow-y-auto max-h-75 pr-1">
            {events.length > 0 ? (
                events.map((e) => (
                    <button
                        key={e.id}
                        type="button"
                        onClick={() => onSelect(e.id)}
                        className="w-full text-left p-2.5 border border-gray-100 rounded-lg hover:border-yellow-primary cursor-pointer bg-white flex items-center gap-3 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-primary"
                    >
                        <div
                            className={`w-1 h-6 rounded-full ${e.type === "agendado" ? "bg-yellow-secondary" : "bg-green-500"}`}
                        ></div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-bold text-gray-800 uppercase truncate">{e.title}</p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock size={10} /> {e.time}
                            </p>
                        </div>
                    </button>
                ))
            ) : (
                <p className="text-xs text-gray-400 text-center py-4">Nenhum evento neste dia.</p>
            )}
        </div>
        <button
            onClick={onClose}
            className="mt-auto w-full py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600"
        >
            Fechar Painel
        </button>
    </>
);
