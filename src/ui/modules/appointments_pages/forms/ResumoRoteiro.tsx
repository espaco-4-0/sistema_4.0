import React from "react";
import { Control, useWatch } from "react-hook-form";

import { START_HOURS, buildTimeline, summarizeStops, toHHMM, toMinutes } from "./booking-utils";
import type { CalendarFormInput } from "./types";

export const ResumoRoteiro = ({ control }: { control: Control<CalendarFormInput> }) => {
    const hora = useWatch({ control, name: "hora" }) as string | undefined;
    const paradas = useWatch({ control, name: "paradas" }) as string[] | undefined;

    const { stops, totalMinutes } = summarizeStops(paradas ?? []);
    if (stops.length === 0) return null;

    const horaInicio = hora ?? START_HOURS[0];
    const inicioMin = toMinutes(horaInicio);
    const fimStr = totalMinutes > 0 ? toHHMM(inicioMin + totalMinutes) : "—";

    const timeline = buildTimeline(horaInicio, paradas ?? []);

    return (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Duração total</span>
                <span className="text-xs font-semibold text-gray-800">{totalMinutes} min</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-0.5 font-medium text-gray-700">
                    {horaInicio}
                </span>
                <span className="text-gray-400 text-xs">→</span>
                <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-0.5 font-medium text-gray-700">
                    {fimStr}
                </span>
            </div>

            <div className="pt-1 flex flex-col gap-0">
                {timeline.map(({ stop, from, to }, i) => {
                    const isLast = i === timeline.length - 1;
                    return (
                        <div key={stop.id} className="flex gap-2 items-stretch">
                            <div className="flex flex-col items-center w-4 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1 shrink-0" />
                                {!isLast && <div className="w-px flex-1 bg-gray-200 min-h-3" />}
                            </div>
                            <div className={`${isLast ? "pb-0" : "pb-2"}`}>
                                <p className="text-xs font-medium text-gray-800 leading-tight">{stop.label}</p>
                                <p className="text-[10px] text-gray-400">
                                    {from} – {to} · {stop.dur} min
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResumoRoteiro;
