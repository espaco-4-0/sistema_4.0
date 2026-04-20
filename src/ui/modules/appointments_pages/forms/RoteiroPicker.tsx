import React, { useMemo } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/ui/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { cn } from "@/src/ui/lib/utils";
import { Check, ChevronsUpDown, Clock } from "lucide-react";
import { Control, Controller, useWatch } from "react-hook-form";

import { START_HOURS, STOPS } from "./booking-utils";
import type { CalendarFormInput } from "./types";

export const RoteiroPicker = ({ control }: { control: Control<CalendarFormInput> }) => {
    const horaInicio = useWatch({ control, name: "hora" });
    const paradasSelecionadas = useWatch({ control, name: "paradas" }) || [];

    const estimativaTermino = useMemo(() => {
        if (!horaInicio || paradasSelecionadas.length === 0) return null;

        const [horas, minutos] = horaInicio.split(":").map(Number);
        const duracaoTotal = STOPS.filter((s) => paradasSelecionadas.includes(s.id)).reduce(
            (acc, curr) => acc + curr.dur,
            0
        );

        const data = new Date();
        data.setHours(horas, minutos + duracaoTotal);

        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }, [horaInicio, paradasSelecionadas]);

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Hora de início</span>
                <Controller
                    name="hora"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white">
                                <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {START_HOURS.map((h) => (
                                    <SelectItem key={h} value={h} className="text-xs">
                                        {h}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* PARADAS DA VISITA */}
            <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Paradas da visita</span>
                <Controller
                    name="paradas"
                    control={control}
                    rules={{ validate: (v) => (v?.length ?? 0) > 0 || "Selecione ao menos uma" }}
                    render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-auto min-h-10 justify-between text-xs font-normal border-gray-200 bg-white hover:bg-white",
                                        field.value?.length > 0 && "border-yellow-400"
                                    )}
                                >
                                    <div className="flex flex-wrap gap-1.5 py-1">
                                        {field.value?.length > 0 ? (
                                            STOPS.filter((s) => field.value.includes(s.id)).map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="bg-yellow-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold"
                                                >
                                                    {s.label}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">Selecione as paradas...</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="h-3 w-3 opacity-50 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-1 bg-white" align="start">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {STOPS.map((stop) => {
                                        const isSelected = field.value?.includes(stop.id);
                                        return (
                                            <button
                                                key={stop.id}
                                                type="button"
                                                onClick={() => {
                                                    const next = isSelected
                                                        ? field.value.filter((id: string) => id !== stop.id)
                                                        : [...(field.value ?? []), stop.id];
                                                    field.onChange(next);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-sm text-xs w-full transition-colors",
                                                    isSelected ? "bg-yellow-50 text-amber-900" : "hover:bg-gray-50"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 border rounded flex items-center justify-center shrink-0",
                                                        isSelected
                                                            ? "bg-yellow-400 border-yellow-500"
                                                            : "border-gray-300"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 text-white stroke-3" />}
                                                </div>
                                                <span className="flex-1 text-left">{stop.label}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">{stop.dur}m</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>

            {estimativaTermino && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-md animate-in fade-in slide-in-from-top-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[11px] text-blue-700">
                        Duração total estimada: <span className="font-bold">{estimativaTermino}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoteiroPicker;
