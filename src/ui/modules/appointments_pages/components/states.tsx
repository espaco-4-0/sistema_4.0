import { CalendarDaysIcon } from "@/src/ui/components/ui/calendar-days";
import { Calendar as CalendarIcon, CheckCircle2, Cog, XCircle } from "lucide-react";

export const IdleState = () => (
    <>
        <CalendarIcon className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm text-center">Selecione uma data para interagir</p>
    </>
);

export const LoadingState = () => (
    <>
        <Cog className="w-8 h-8 text-yellow-primary animate-spin" />
        <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">Processando...</p>
    </>
);

export const SuccessState = ({ onBack }: { onBack: () => void }) => (
    <>
        <div className="bg-green-50 p-3 rounded-full mb-3">
            <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-green-600 font-bold text-sm uppercase">Agendado!</h3>
        <button
            onClick={onBack}
            className="mt-6 text-[10px] font-bold text-black border-b-2 border-yellow-400 uppercase"
        >
            Voltar
        </button>
    </>
);

export const ErrorState = ({ onBack, message }: { onBack: () => void; message?: string }) => (
    <>
        <div className="bg-red-50 p-3 rounded-full mb-3">
            <XCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-red-600 font-bold text-sm uppercase">Horário Indisponível!</h3>
        <p className="text-gray-400 text-xs text-center mt-2 px-4">
            {message || "Já existe um evento agendado neste intervalo. Por favor, escolha outro horário."}
        </p>
        <button onClick={onBack} className="mt-6 text-[10px] font-bold text-black border-b-2 border-red-400 uppercase">
            Tentar Outro
        </button>
    </>
);

export const WeekendState = ({ target }: { target: Date }) => {
    const isWeekend = target.getDay() === 0 || target.getDay() === 6;

    if (!isWeekend) return null;

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <CalendarIcon className="w-10 h-10 text-gray-300" />
            <p className="text-gray-400 text-sm text-center">
                Finais de semana não estão disponíveis para agendamento.
            </p>
        </div>
    );
};

export const PastState = ({ date }: { date: Date }) => {
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    if (!isPast) return null;

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <CalendarDaysIcon className=" text-gray-600" size={40} />
            <p className="text-gray-400 text-sm text-center leading-relaxed">
                Dias que já se passaram não estao disponíveis para solicitações de agendamento
            </p>
        </div>
    );
};
