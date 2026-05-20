import React from "react";
import { Phone, School, User, Users } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

import { RoteiroPicker } from "../RoteiroPicker";
import type { CalendarFormInput } from "../types";
import { InputWithIcon } from "./InputWithIcon";

export type PedidoPanelProps = {
    methods: UseFormReturn<CalendarFormInput>;
    onNext: () => void;
    onCancel?: () => void;
    maxStudents?: number;
};

export const PedidoPanel: React.FC<PedidoPanelProps> = ({ methods, onNext, onCancel, maxStudents }) => {
    const requiredPedidoFields: Array<keyof CalendarFormInput> = [
        "instituicao",
        "professor",
        "email",
        "whatsapp",
        "quantidade",
        "paradas",
    ];

    async function handleNextStep() {
        const valid = await methods.trigger(requiredPedidoFields);
        if (!valid) return;
        onNext();
    }

    return (
        <div className="grid gap-2.5">
            <InputWithIcon
                icon={<School size={14} />}
                register={methods.register("instituicao", { required: true })}
                placeholder="Instituição"
            />

            <InputWithIcon
                icon={<User size={14} />}
                register={methods.register("professor", { required: true })}
                placeholder="Professor Responsável"
            />

            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none">
                        <Phone size={14} />
                    </div>
                    <Controller
                        name="whatsapp"
                        control={methods.control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <input
                                value={value ?? ""}
                                onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                                className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary"
                                placeholder="Whatsapp"
                                maxLength={15}
                                aria-label="Whatsapp"
                            />
                        )}
                    />
                </div>

                <InputWithIcon
                    icon={<Users size={14} />}
                    register={methods.register("quantidade", { required: true })}
                    type="number"
                    placeholder="Pessoas"
                    min={1}
                    max={maxStudents}
                />
            </div>

            <input
                {...methods.register("email", { required: true })}
                type="email"
                className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs outline-none focus:border-yellow-primary"
                placeholder="Email"
            />

            <RoteiroPicker control={methods.control} setValue={methods.setValue} />

            <textarea
                {...methods.register("mensagem")}
                className="w-full border border-gray-200 rounded-md p-2 text-xs outline-none focus:border-yellow-primary resize-none"
                placeholder="Objetivo (opcional)"
                rows={2}
            />

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={handleNextStep}
                    className="hover:cursor-pointer w-full bg-yellow-primary text-black hover:bg-yellow-primary-dark font-bold py-2.5 rounded-md text-[11px] uppercase shadow-sm"
                >
                    Próxima etapa: Documentação
                </button>

                {onCancel && (
                    <button type="button" onClick={onCancel} className="w-full text-sm text-gray-600 underline">
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
};

export default PedidoPanel;
