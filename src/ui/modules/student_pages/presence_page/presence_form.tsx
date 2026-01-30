import { Button } from "@/src/ui/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/src/ui/components/ui/field";
import { Textarea } from "@/src/ui/components/ui/textarea";
import { CalendarX2, Check, Loader2, X } from "lucide-react";

export interface PresenceFormProps {
    isPast: boolean;
    isLoading: boolean;
    value: "present" | "absent" | "";
    absenceReason: string;
    onChangeValue: (v: "present" | "absent") => void;
    onChangeReason: (v: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export default function PresenceForm({
    isPast,
    isLoading,
    value,
    absenceReason,
    onChangeValue,
    onChangeReason,
    onSubmit,
    onCancel,
}: Readonly<PresenceFormProps>) {
    if (isPast) {
        return (
            <>
                <p className="mt-4 text-lg font-medium">Evento passado. Registre uma justificativa de ausência.</p>

                <FieldGroup className="bg-red-50 border-2 p-4 mt-2 rounded-md">
                    <Field>
                        <FieldLabel>Motivo da Ausência *</FieldLabel>
                        <Textarea
                            value={absenceReason}
                            onChange={(e) => onChangeReason(e.target.value)}
                            placeholder="Informe o motivo"
                        />

                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <Button
                                onClick={onSubmit}
                                disabled={isLoading || !absenceReason.trim()}
                                className="bg-red-500 hover:bg-red-600 cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <CalendarX2 />}
                                Confirmar ausência
                            </Button>

                            <Button variant="outline" className="cursor-pointer" onClick={onCancel}>
                                Cancelar
                            </Button>
                        </div>
                    </Field>
                </FieldGroup>
            </>
        );
    }

    return (
        <>
            <p className="mt-4 text-lg font-medium">Poderá comparecer presencialmente?</p>

            <div className="mt-4 space-y-3">
                {[
                    { id: "present", label: "Sim, estarei presente", color: "green", icon: Check },
                    { id: "absent", label: "Não poderei comparecer", color: "red", icon: X },
                ].map(({ id, label, color, icon: Icon }) => (
                    <label
                        key={id}
                        className={`flex items-center gap-3 border-2 p-4 rounded-lg cursor-pointer ${
                            value === id ? `bg-${color}-50 border-${color}-500` : "border-gray-300"
                        }`}
                    >
                        <input
                            type="radio"
                            name="presence"
                            value={id}
                            checked={value === id}
                            onChange={() => onChangeValue(id as "present" | "absent")}
                            className="sr-only"
                        />
                        <div
                            className={`w-10 h-10 flex items-center justify-center border-2 rounded-md ${
                                value === id ? `bg-${color}-500 border-${color}-500` : ""
                            }`}
                        >
                            {value === id && <Icon className="text-white" />}
                        </div>

                        <span className="flex-1">{label}</span>
                    </label>
                ))}
            </div>

            {value === "absent" && (
                <FieldGroup className="bg-red-50 border-2 p-4 mt-4 rounded-md">
                    <Field>
                        <FieldLabel>Motivo da Ausência *</FieldLabel>
                        <Textarea
                            value={absenceReason}
                            onChange={(e) => onChangeReason(e.target.value)}
                            placeholder="Informe o motivo"
                        />
                    </Field>
                </FieldGroup>
            )}

            <Button
                className="w-full h-12 mt-6 bg-yellow-primary cursor-pointer"
                disabled={!value || (value === "absent" && !absenceReason.trim()) || isLoading}
                onClick={onSubmit}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : "Confirmar resposta"}
            </Button>

            <Button variant="outline" className="w-full h-12 mt-3 cursor-pointer" onClick={onCancel}>
                Fechar painel
            </Button>
        </>
    );
}
