import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { ArrowLeft, Phone, School, User, Users } from "lucide-react";
import { Control, Controller, UseFormRegisterReturn, UseFormReturn } from "react-hook-form";

export interface CalendarFormInput {
    instituicao: string;
    professor: string;
    email: string;
    whatsapp: string;
    quantidade: string;
    hora: string;
    horaSaida: string;
    mensagem: string;
}

const timeOptions = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const formatPhoneNumber = (value: string) => {
    if (!value) return "";
    const cleaned = value.replaceAll(/\D/g, "");
    const regex = /^(\d{0,2})(\d{0,5})(\d{0,4})$/;
    const match = regex.exec(cleaned);
    if (!match) return value;

    const [_, ddd, prefixo, sufixo] = match;

    if (!prefixo) return ddd;
    const base = `${ddd} ${prefixo}`;
    return sufixo ? ` ${base}-${sufixo}` : base;
};

export const BookingForm = ({
    methods,
    onSubmit,
    onCancel,
    maxStudents,
}: {
    methods: UseFormReturn<CalendarFormInput>;
    onSubmit: (d: CalendarFormInput) => void;
    onCancel: () => void;
    maxStudents?: number;
}) => (
    <>
        <div className="flex items-center gap-2 mb-4">
            <button onClick={onCancel} className="text-gray-400 hover:text-black">
                <ArrowLeft size={16} />
            </button>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Nova Solicitação</span>
        </div>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full space-y-3">
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
                                    onChange={(e) => {
                                        onChange(formatPhoneNumber(e.target.value));
                                    }}
                                    className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary"
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
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs outline-none focus:border-yellow-primary"
                    placeholder="Email"
                />
                <div className="grid grid-cols-2 gap-2">
                    <TimeSelect label="Início" name="hora" control={methods.control} />
                    <TimeSelect label="Fim" name="horaSaida" control={methods.control} />
                </div>
                <textarea
                    {...methods.register("mensagem")}
                    className="w-full border border-gray-200 rounded-md p-2 text-xs outline-none focus:border-yellow-primary resize-none"
                    placeholder="Objetivo (opcional)"
                    rows={2}
                />
            </div>
            <button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 font-bold py-2.5 rounded-md text-[11px] uppercase shadow-sm"
            >
                Confirmar
            </button>
        </form>
    </>
);

interface InputWithIconProps {
    icon: React.ReactNode;
    register: UseFormRegisterReturn;
    type?: string;
    placeholder: string;
    min?: number;
    max?: number;
}

const InputWithIcon = ({ icon, register, type = "text", placeholder, min, max }: InputWithIconProps) => (
    <div className="relative">
        <div className="absolute left-2.5 top-2.5 text-gray-400">{icon}</div>
        <input
            {...register}
            type={type}
            min={min}
            max={max}
            className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary"
            placeholder={placeholder}
        />
    </div>
);

interface TimeSelectProps {
    label: string;
    name: keyof CalendarFormInput;
    control: Control<CalendarFormInput>;
}

const TimeSelect = ({ label, name, control }: TimeSelectProps) => (
    <div className="space-y-1">
        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">{label}</span>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-40">
                        {timeOptions.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    </div>
);
