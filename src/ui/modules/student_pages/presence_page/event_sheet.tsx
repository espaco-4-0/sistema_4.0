import { useEffect, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/src/ui/components/ui/field";
import { Label } from "@/src/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/ui/components/ui/radio-group";
import { Textarea } from "@/src/ui/components/ui/textarea";
import { AlertCircleIcon, CalendarX2, Check, CircleX, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "../../../components/ui/sheet";
import EventInformatons from "./event_informations";

type EventSituation = "pending" | "confirmed" | "absent";

interface BadgeConfig {
    icon: React.ComponentType<{ size: number; className?: string }>;
    text: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}

const getBadgeConfig = (situation: EventSituation): BadgeConfig => {
    const configs: Record<EventSituation, BadgeConfig> = {
        confirmed: {
            icon: Check,
            text: "Presença confirmada",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-700",
        },
        absent: {
            icon: CircleX,
            text: "Ausência registrada",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-700",
        },
        pending: {
            icon: AlertCircleIcon,
            text: "Aguardando confirmação",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            textColor: "text-yellow-700",
        },
    };
    return configs[situation];
};

interface ConfirmedStatusProps {
    onAlterStatus: () => void;
    onClose: () => void;
    canAlter?: boolean;
    isAltering?: boolean;
}

const ConfirmedStatus = ({ onAlterStatus, onClose, canAlter = true, isAltering = false }: ConfirmedStatusProps) => (
    <>
        <div className="flex items-center gap-2 border-2 mt-2 bg-green-50 rounded-md p-2 border-green-200">
            <Check size={30} className="mx-2 text-green-700" />
            <div className="flex flex-col gap-1">
                <span className="text-green-700">Sua presença foi confirmada com sucesso!</span>
                <span className="text-sm text-green-900">Registrado em 22/01/2026, 13:46:21</span>
            </div>
        </div>
        {canAlter && (
            <Button
                variant="outline"
                className="w-full h-12 mt-3 cursor-pointer flex gap-2 items-center justify-center"
                onClick={onAlterStatus}
                disabled={isAltering}
            >
                {isAltering ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        Alterando...
                    </>
                ) : (
                    "Alterar status"
                )}
            </Button>
        )}
        <Button variant="outline" onClick={onClose} className="w-full h-12 mt-3 cursor-pointer">
            Fechar painel
        </Button>
    </>
);

interface AbsentStatusProps {
    onAlterStatus: () => void;
    onClose: () => void;
    canAlter?: boolean;
    isAltering?: boolean;
}

const AbsentStatus = ({ onAlterStatus, onClose, canAlter = true, isAltering = false }: AbsentStatusProps) => (
    <>
        <div className="flex items-center gap-2 border-2 mt-2 bg-red-50 rounded-md p-2 border-red-200">
            <CircleX size={30} className="mx-2 text-red-700" />
            <div className="flex flex-col gap-1">
                <span className="text-red-700">Sua ausência foi registrada com sucesso!</span>
                <span className="text-sm text-red-900">Registrado em 22/01/2026, 13:46:21</span>
            </div>
        </div>
        {canAlter && (
            <Button
                variant="outline"
                className="w-full h-12 mt-3 cursor-pointer flex gap-2 items-center justify-center"
                onClick={onAlterStatus}
                disabled={isAltering}
            >
                {isAltering ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        Alterando...
                    </>
                ) : (
                    "Alterar status"
                )}
            </Button>
        )}
        <Button
            onClick={onClose}
            className="bg-yellow-secondary text-black hover:bg-yellow-secondary-dark w-full h-12 mt-3 cursor-pointer"
        >
            Fechar painel
        </Button>
    </>
);

interface AbsenceFormProps {
    isConfirming: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const AbsenceForm = ({ isConfirming, onConfirm, onCancel }: AbsenceFormProps) => (
    <FieldGroup className="bg-red-50 border-2 p-4 mt-2 border-red-200 rounded-md">
        <Field className="flex flex-col">
            <FieldLabel className=" -mb-2">Motivo da Ausência *</FieldLabel>
            <Textarea
                className="placeholder:text-md resize-none"
                placeholder="Por favor, informe o motivo da sua ausência"
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
                <Button
                    disabled={isConfirming}
                    onClick={onConfirm}
                    className={`h-10 font-semibold text-md flex gap-2 items-center justify-center transition-all ${
                        isConfirming
                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-red-500 cursor-pointer hover:bg-red-600"
                    }`}
                >
                    {isConfirming ? (
                        <>
                            <Loader2 className="size-5 animate-spin" /> Processando...
                        </>
                    ) : (
                        <>
                            <CalendarX2 className="size-5" /> Confirmar ausência
                        </>
                    )}
                </Button>
                <Button
                    disabled={isConfirming}
                    onClick={onCancel}
                    className={`h-10 font-semibold text-md flex gap-2 items-center justify-center transition-all ${
                        isConfirming
                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-black/80 cursor-pointer hover:bg-black"
                    }`}
                >
                    Cancelar
                </Button>
            </div>
        </Field>
    </FieldGroup>
);

interface EventSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    situation: EventSituation;
    start?: Date;
    date: string;
    instructor: string;
    location: string;
    observation: string;
    eventId?: string | number;
    onSituationChange?: (eventId: string | number, newSituation: EventSituation) => void;
}

export default function EventSheet({
    isOpen,
    onOpenChange,
    title,
    description,
    situation,
    start,
    date,
    instructor,
    location,
    observation,
    eventId,
    onSituationChange,
}: EventSheetProps) {
    const [isConfirmingAbsence, setIsConfirmingAbsence] = useState(false);
    const [eventSituation, setEventSituation] = useState<EventSituation>("pending");
    const [presenceResponse, setPresenceResponse] = useState<string>("");
    const [absenceReason, setAbsenceReason] = useState<string>("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isAlteringStatus, setIsAlteringStatus] = useState(false);
    const isPast = start ? new Date(start) < new Date() : false;

    useEffect(() => {
        setEventSituation(situation || "pending");
        setPresenceResponse("");
        setIsConfirming(false);
        setIsConfirmingAbsence(false);
        setIsAlteringStatus(false);
    }, [situation, isOpen]);

    const badge = getBadgeConfig(eventSituation);

    const handleConfirmAbsence = () => {
        setIsConfirmingAbsence(true);
        setTimeout(() => {
            setEventSituation("absent");
            if (eventId && onSituationChange) {
                onSituationChange(eventId, "absent");
            }
            toast.error("Ausência registrada", {
                description: "Sua justificativa de ausência foi registrada com sucesso.",
            });
            setIsConfirmingAbsence(false);
        }, 2000);
    };

    const handleConfirmResponse = () => {
        if (!presenceResponse) return;
        // Para eventos futuros com ausência, validar se o motivo foi preenchido
        if (!isPast && presenceResponse === "absent" && !absenceReason.trim()) return;

        setIsConfirming(true);
        setTimeout(() => {
            const newSituation = presenceResponse === "present" ? "confirmed" : "absent";
            setEventSituation(newSituation);
            if (eventId && onSituationChange) {
                onSituationChange(eventId, newSituation);
            }

            if (newSituation === "confirmed") {
                toast.success("Presença confirmada!", {
                    description: "Sua presença no evento foi confirmada com sucesso.",
                });
            } else {
                toast.error("Ausência registrada", {
                    description: "Sua ausência foi registrada com sucesso.",
                });
            }

            setIsConfirming(false);
            setPresenceResponse("");
            setAbsenceReason("");
        }, 2000);
    };

    const handleAlterStatus = () => {
        setIsAlteringStatus(true);
        setTimeout(() => {
            setEventSituation("pending");
            if (eventId && onSituationChange) {
                onSituationChange(eventId, "pending");
            }
            toast.info("Status alterado", {
                description: "Você pode confirmar sua presença novamente.",
            });
            setIsAlteringStatus(false);
        }, 1500);
    };

    const renderPresenceControl = () => {
        if (eventSituation === "confirmed") {
            return (
                <ConfirmedStatus
                    onAlterStatus={handleAlterStatus}
                    onClose={() => onOpenChange(false)}
                    canAlter={!isPast}
                    isAltering={isAlteringStatus}
                />
            );
        }

        if (eventSituation === "absent") {
            return (
                <AbsentStatus
                    onAlterStatus={handleAlterStatus}
                    onClose={() => onOpenChange(false)}
                    canAlter={!isPast}
                    isAltering={isAlteringStatus}
                />
            );
        }

        if (isPast) {
            return (
                <>
                    <p className="mt-4 text-lg font-medium text-gray-800">
                        Evento passado. Registre uma justificativa de ausência.
                    </p>
                    <AbsenceForm
                        isConfirming={isConfirmingAbsence}
                        onConfirm={handleConfirmAbsence}
                        onCancel={() => onOpenChange(false)}
                    />
                </>
            );
        }

        return (
            <>
                <p className="mt-4 text-lg font-medium text-gray-800">Poderá comparecer presencialmente?</p>
                <RadioGroup value={presenceResponse} onValueChange={setPresenceResponse} className="mt-4 space-y-3">
                    <div
                        onClick={() => setPresenceResponse("present")}
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all cursor-pointer ${
                            presenceResponse === "present"
                                ? "bg-green-50 border-green-500"
                                : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-md border-2 transition-all ${
                                presenceResponse === "present"
                                    ? "bg-green-500 border-green-500"
                                    : "bg-white border-gray-300"
                            }`}
                        >
                            {presenceResponse === "present" && <Check className="w-6 h-6 text-white" />}
                        </div>
                        <RadioGroupItem value="present" id="present" className="sr-only" />
                        <Label htmlFor="present" className="cursor-pointer flex-1 text-base font-medium">
                            Sim, estarei presente
                        </Label>
                    </div>
                    <div
                        onClick={() => setPresenceResponse("absent")}
                        className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all cursor-pointer ${
                            presenceResponse === "absent"
                                ? "bg-red-50 border-red-500"
                                : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-md border-2 transition-all ${
                                presenceResponse === "absent" ? "bg-red-500 border-red-500" : "bg-white border-gray-300"
                            }`}
                        >
                            {presenceResponse === "absent" && <X className="w-6 h-6 text-white" />}
                        </div>
                        <RadioGroupItem value="absent" id="absent" className="sr-only" />
                        <Label htmlFor="absent" className="cursor-pointer flex-1 text-base font-medium">
                            Não poderei comparecer
                        </Label>
                    </div>
                </RadioGroup>
                {presenceResponse === "absent" && (
                    <FieldGroup className="bg-red-50 border-2 p-4 mt-4 border-red-200 rounded-md">
                        <Field className="flex flex-col">
                            <FieldLabel className="-mb-2">Motivo da Ausência *</FieldLabel>
                            <Textarea
                                value={absenceReason}
                                onChange={(e) => setAbsenceReason(e.target.value)}
                                className="placeholder:text-md resize-none mt-3"
                                placeholder="Por favor, informe o motivo da sua ausência"
                            />
                        </Field>
                    </FieldGroup>
                )}
                <Button
                    onClick={handleConfirmResponse}
                    disabled={
                        !presenceResponse || isConfirming || (presenceResponse === "absent" && !absenceReason.trim())
                    }
                    className={`w-full h-12 mt-6 font-semibold text-md flex gap-2 items-center justify-center transition-all ${
                        !presenceResponse || isConfirming || (presenceResponse === "absent" && !absenceReason.trim())
                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-yellow-primary cursor-pointer hover:bg-yellow-600"
                    }`}
                >
                    {isConfirming ? (
                        <>
                            <Loader2 className="size-5 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        "Confirmar resposta"
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full h-12 mt-3 cursor-pointer"
                >
                    Fechar painel
                </Button>
            </>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="max-w-full! w-3/10! [&>button:first-of-type]:hidden gap-0">
                <SheetHeader className="border-b flex flex-row items-center justify-between p-6">
                    <span className="text-2xl font-semibold">Detalhes do evento</span>
                    <SheetClose className="cursor-pointer hover:bg-gray-description-light/25 size-8 flex justify-center items-center rounded-lg transition-all">
                        <X size={20} />
                    </SheetClose>
                </SheetHeader>
                <div className="p-6">
                    <div className="flex justify-between items-center w-full">
                        <SheetTitle className="text-3xl text-yellow-muted-light font-bold">
                            {title || "Curso Básico de Programação"}
                        </SheetTitle>
                        <Badge
                            className={`h-8 w-auto flex gap-2 ${badge.bgColor} text-xs ${badge.textColor} border-2 ${badge.borderColor}`}
                        >
                            <badge.icon size={16} />
                            {badge.text}
                        </Badge>
                    </div>
                    <SheetDescription className="my-4 text-gray-700 text-lg">
                        {description || "Fundamentos de programação usando Python."}
                    </SheetDescription>
                    <EventInformatons />
                    <hr className="my-5" />
                    <h3 className="text-xl font-semibold">Controle de Presença</h3>
                    {renderPresenceControl()}
                </div>
            </SheetContent>
        </Sheet>
    );
}
