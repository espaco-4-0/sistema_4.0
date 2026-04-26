import React, { useState } from "react";
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/src/components/animate-ui/components/base/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, FileText, Phone, School, User, Users } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";

import RoteiroPicker from "./RoteiroPicker";
import { formatPhoneNumber } from "./booking-utils";
import type { CalendarFormInput } from "./types";

export const BookingForm = ({
    methods,
    onSubmit,
    onCancel,
    maxStudents,
    selectedDate,
}: {
    methods: UseFormReturn<CalendarFormInput>;
    onSubmit: (d: CalendarFormInput) => void;
    onCancel: () => void;
    maxStudents?: number;
    selectedDate: Date;
}) => {
    const [activeTab, setActiveTab] = useState<"pedido" | "documentacao">("pedido");

    const anexos = methods.watch("anexos") as FileList | null;

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
        setActiveTab("documentacao");
    }

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-black hover:cursor-pointer transition-all"
                    type="button"
                >
                    <ArrowLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Nova Solicitação</span>
                <span className="text-[10px] text-gray-500 ml-auto">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
            </div>

            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "pedido" | "documentacao")}>
                <div className="relative mb-3">
                    <TabsList className="grid grid-cols-2 w-full h-10 bg-gray-100/50 p-1 rounded-lg">
                        <TabsTab
                            value="pedido"
                            className="rounded-md text-xs font-semibold py-2 text-gray-500 data-selected:text-yellow-900 data-selected:bg-white data-selected:shadow-sm"
                        >
                            Envio de Pedido
                        </TabsTab>
                        <TabsTab
                            value="documentacao"
                            className="rounded-md text-xs font-semibold py-2 text-gray-500 data-selected:text-yellow-900 data-selected:bg-white data-selected:shadow-sm"
                        >
                            Documentação
                        </TabsTab>
                    </TabsList>
                </div>

                <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full space-y-3">
                    <TabsPanels>
                        <TabsPanel value="pedido" className="grid gap-2.5">
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
                                    <div className="absolute left-2.5 top-2.5 text-gray-400">
                                        <Phone size={14} />
                                    </div>
                                    <Controller
                                        name="whatsapp"
                                        control={methods.control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <input
                                                value={value}
                                                onChange={(e) => onChange(formatPhoneNumber(e.target.value))}
                                                className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary/20"
                                                placeholder="Whatsapp"
                                                maxLength={15}
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
                                className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs outline-none focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary/20"
                                placeholder="Email"
                            />

                            <RoteiroPicker control={methods.control} setValue={methods.setValue} />

                            <textarea
                                {...methods.register("mensagem")}
                                className="w-full border border-gray-200 rounded-md p-2 text-xs outline-none focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary/20 resize-none"
                                placeholder="Objetivo (opcional)"
                                rows={2}
                            />

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="cursor-pointer w-full bg-yellow-primary text-black hover:bg-yellow-500 font-bold py-2.5 rounded-md text-[11px] uppercase shadow-sm transition-colors"
                            >
                                Próxima etapa: Documentação
                            </button>
                        </TabsPanel>

                        <TabsPanel value="documentacao" className="space-y-3">
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 leading-relaxed">
                                Anexe os documentos obrigatórios do pedido (ex.: ofício da escola, lista de alunos,
                                autorização da direção).
                            </div>

                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                    {...methods.register("anexos")}
                                    className="w-full border border-gray-200 rounded-md py-2 pl-9 pr-2 text-xs outline-none focus:border-yellow-primary file:mr-2 file:rounded file:border-0 file:bg-yellow-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-amber-800"
                                />
                            </div>

                            <label className="flex items-start gap-2 text-[11px] text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...methods.register("confirmacaoDocumentos", { required: true })}
                                    className="mt-0.5 accent-yellow-primary"
                                />
                                <span>
                                    Confirmo que a documentação anexada está correta para análise administrativa.
                                </span>
                            </label>

                            {anexos && anexos.length > 0 && (
                                <div className="rounded-md border border-gray-200 p-2 bg-white">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">
                                        Arquivos selecionados ({anexos.length})
                                    </p>
                                    <ul className="space-y-1">
                                        {Array.from(anexos).map((file, idx) => (
                                            <li
                                                key={`${file.name}-${idx}`}
                                                className="text-[11px] text-gray-700 flex items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-100"
                                            >
                                                <FileText size={12} className="text-gray-400" />
                                                <span className="truncate">{file.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full cursor-pointer bg-black text-yellow-primary hover:bg-gray-800 font-bold py-2.5 rounded-md text-[11px] uppercase shadow-sm transition-colors disabled:opacity-50"
                            >
                                Confirmar Pedido
                            </button>
                        </TabsPanel>
                    </TabsPanels>
                </form>
            </Tabs>
        </>
    );
};

interface InputWithIconProps {
    icon: React.ReactNode;
    register: ReturnType<UseFormReturn<CalendarFormInput>["register"]>;
    type?: string;
    placeholder: string;
    min?: number;
    max?: number;
}

const InputWithIcon = ({ icon, register, type = "text", placeholder, min, max }: InputWithIconProps) => (
    <div className="relative">
        <div className="absolute left-2.5 top-2.5 text-gray-400">{icon}</div>
        <input
            {...(register as any)}
            type={type}
            min={min}
            max={max}
            className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary/20"
            placeholder={placeholder}
        />
    </div>
);
