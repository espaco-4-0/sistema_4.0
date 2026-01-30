import { Button } from "@/src/ui/components/ui/button";
import { Check, CircleX, Loader2 } from "lucide-react";

export const STATUS_CONFIG = {
    confirmed: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-700",
        icon: Check,
        message: "Sua presença foi confirmada com sucesso!",
    },
    absent: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-700",
        icon: CircleX,
        message: "Sua ausência foi registrada com sucesso!",
    },
};

export interface StatusCardProps {
    type: "confirmed" | "absent";
    canAlter: boolean;
    isLoading: boolean;
    registeredAt?: string;
    onAlter: () => void;
    onClose: () => void;
}

export default function StatusCard({
    type,
    canAlter,
    isLoading,
    registeredAt,
    onAlter,
    onClose,
}: Readonly<StatusCardProps>) {
    const { bg, text, icon: Icon, message } = STATUS_CONFIG[type];

    return (
        <>
            <div className={`flex items-center gap-2 border-2 mt-2 p-2 rounded-md ${bg}`}>
                <Icon size={30} className={`mx-2 ${text}`} />
                <div className="flex flex-col gap-1">
                    <span className={text}>{message}</span>
                    <span className={`text-sm ${text}`}>Registrado em {registeredAt ?? "--"}</span>
                </div>
            </div>

            {canAlter && (
                <Button
                    variant="outline"
                    className="w-full h-12 mt-3 cursor-pointer"
                    disabled={isLoading}
                    onClick={onAlter}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Alterar status"}
                </Button>
            )}

            <Button variant="outline" className="w-full h-12 mt-3 cursor-pointer" onClick={onClose}>
                Fechar painel
            </Button>
        </>
    );
}
