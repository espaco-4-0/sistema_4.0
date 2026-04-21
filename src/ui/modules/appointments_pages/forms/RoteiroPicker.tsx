"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getLocais } from "@/src/lib/locais-api";
import { Button } from "@/src/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/ui/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { cn } from "@/src/ui/lib/utils";
import { Check, ChevronsUpDown, Clock } from "lucide-react";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";

import { START_HOURS } from "./booking-utils";
import type { CalendarFormInput } from "./types";

interface RoteiroPickerProps {
    control: Control<CalendarFormInput, any>;
    setValue: UseFormSetValue<CalendarFormInput>;
}

export const RoteiroPicker = ({ control, setValue }: RoteiroPickerProps) => {
    const horaInicio = useWatch({ control, name: "hora" });
    const paradasSelecionadas = useWatch({ control, name: "paradas" }) || [];

    const [locais, setLocais] = useState<Array<{ id: string; label: string; duracaoMin?: number }>>([]);

    useEffect(() => {
        async function load() {
            try {
                const list = await getLocais(false);
                setLocais(
                    list.map((l) => ({
                        id: l.id,
                        label: l.nome,
                        duracaoMin: l.duracaoMin ?? 0,
                    }))
                );
            } catch (error) {
                console.error("Erro ao carregar locais no RoteiroPicker:", error);
            }
        }
        load();
    }, []);

    const estimativaTermino = useMemo(() => {
        if (!horaInicio || paradasSelecionadas.length === 0) return null;

        const [horas, minutos] = horaInicio.split(":").map(Number);
        const duracaoTotal = locais
            .filter((s) => paradasSelecionadas.includes(s.id))
            .reduce((acc, curr) => acc + (curr.duracaoMin ?? 0), 0);

        const data = new Date();
        data.setHours(horas, minutos + duracaoTotal);

        const timeString = data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        // Atualiza o valor real do formulário para o envio
        setValue("horaSaida", timeString);

        return timeString;
    }, [horaInicio, paradasSelecionadas, locais, setValue]);

    return (
        <div className="space-y-4">
            {/* HORA DE INÍCIO - Único input de tempo */}
            <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Hora de início</span>
                <Controller
                    name="hora"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white">
                                <SelectValue placeholder="Selecione o horário de início" />
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

            {/* SELETOR DE PARADAS (DROPDOWN) */}
            <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Locais / Paradas da visita</span>
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
                                        "w-full h-10 justify-between text-xs font-normal border-gray-200 bg-white hover:bg-white transition-all",
                                        field.value?.length > 0 && "border-yellow-400 ring-1 ring-yellow-100"
                                    )}
                                >
                                    <div className="flex flex-wrap gap-1.5 py-1">
                                        {field.value?.length > 0 ? (
                                            <span className="font-medium text-gray-900">
                                                {field.value.length}{" "}
                                                {field.value.length === 1 ? "local selecionado" : "locais selecionados"}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Selecione os locais...</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className="h-3 w-3 opacity-50 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[--radix-popover-trigger-width] p-1 bg-white shadow-xl border-gray-100"
                                align="start"
                            >
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                    {locais.length === 0 && (
                                        <div className="p-4 text-center text-[10px] text-gray-400">
                                            Carregando locais...
                                        </div>
                                    )}
                                    {locais.map((stop) => {
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
                                                    "flex items-center gap-2 px-3 py-2 rounded-md text-xs w-full transition-colors mb-0.5",
                                                    isSelected
                                                        ? "bg-yellow-50 text-amber-900 font-medium"
                                                        : "hover:bg-gray-50 text-gray-600"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-all",
                                                        isSelected
                                                            ? "bg-yellow-400 border-yellow-500 shadow-sm"
                                                            : "border-gray-300 bg-white"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                                                    )}
                                                </div>
                                                <span className="flex-1 text-left">{stop.label}</span>
                                                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                                    {stop.duracaoMin ? `${stop.duracaoMin}m` : "0m"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>

            {/* RESUMO DE DURAÇÃO E HORA DE SAÍDA */}
            {estimativaTermino && (
                <div className="flex flex-col gap-1.5 p-3 bg-blue-50/50 border border-blue-100 rounded-md animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-[11px] text-blue-700 font-medium">
                            Duração total:{" "}
                            <span className="font-bold">
                                {locais
                                    .filter((s) => paradasSelecionadas.includes(s.id))
                                    .reduce((acc, curr) => acc + (curr.duracaoMin ?? 0), 0)}{" "}
                                min
                            </span>
                        </p>
                    </div>
                    <p className="text-[11px] text-blue-700 ml-5">
                        Término estimado (Saída): <span className="font-bold text-blue-800">{estimativaTermino}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoteiroPicker;
