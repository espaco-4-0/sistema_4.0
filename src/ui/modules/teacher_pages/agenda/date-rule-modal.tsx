"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Switch } from "@/src/ui/components/ui/switch";
import { saveDateRule, deleteDateRule } from "@/src/ui/lib/visit-requests-api";
import { toast } from "sonner";
import { CalendarDays, AlertTriangle, Trash2 } from "lucide-react";

interface DateRuleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    selectedDates: Date[];
    existingRule: { isAvailable: boolean; reason: string | null } | null;
    defaultIsAvailable: boolean;
    onSaved: () => void;
}

export function DateRuleModal({
    isOpen,
    onOpenChange,
    onClose,
    selectedDates,
    existingRule,
    defaultIsAvailable,
    onSaved,
}: DateRuleModalProps) {
    const [isAvailable, setIsAvailable] = useState(true);
    const [reason, setReason] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (existingRule) {
                setIsAvailable(existingRule.isAvailable);
                setReason(existingRule.reason || "");
            } else {
                setIsAvailable(defaultIsAvailable);
                setReason("");
            }
        }
    }, [isOpen, existingRule, defaultIsAvailable]);

    const formattedPeriod = () => {
        if (selectedDates.length === 0) return "";
        if (selectedDates.length === 1) {
            return format(selectedDates[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        }
        // Range
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        const startStr = format(sorted[0], "dd/MM/yyyy");
        const endStr = format(sorted[sorted.length - 1], "dd/MM/yyyy");
        return `${startStr} a ${endStr} (${selectedDates.length} dias)`;
    };

    async function handleSave() {
        if (selectedDates.length === 0) return;

        if (!isAvailable && !reason.trim() && defaultIsAvailable) {
            toast.error("Por favor, informe uma justificativa ao bloquear datas.");
            return;
        }

        setIsSaving(true);
        try {
            const dateStrings = selectedDates.map((d) => format(d, "yyyy-MM-dd"));
            await saveDateRule(dateStrings, isAvailable, isAvailable ? undefined : reason.trim());
            toast.success("Regras de data atualizadas com sucesso!");
            onSaved();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar regras.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (selectedDates.length !== 1) return;
        setIsDeleting(true);
        try {
            const dateStr = format(selectedDates[0], "yyyy-MM-dd");
            await deleteDateRule(dateStr);
            toast.success("Regra de data removida com sucesso!");
            onSaved();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Erro ao remover regra.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-yellow-500" />
                        <span>Configurar Disponibilidade</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div>
                        <Label className="text-gray-500 text-xs uppercase tracking-wider">Período Selecionado</Label>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{formattedPeriod()}</p>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                            <Label htmlFor="available-switch" className="font-semibold text-gray-800">
                                Disponível para visitas
                            </Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isAvailable
                                    ? "Visitantes podem agendar neste dia"
                                    : "Este dia estará bloqueado no portal"}
                            </p>
                        </div>
                        <Switch
                            id="available-switch"
                            checked={isAvailable}
                            onCheckedChange={setIsAvailable}
                        />
                    </div>

                    {!isAvailable && (
                        <div className="space-y-2">
                            <Label htmlFor="reason-input" className="font-semibold text-gray-800">
                                Justificativa {defaultIsAvailable && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="reason-input"
                                placeholder="Ex: Feriado Institucional, Conselho de Classe..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full"
                            />
                            <p className="text-[11px] text-gray-500 flex items-start gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-yellow-600" />
                                <span>Esta justificativa será visível para os visitantes ao tentarem agendar.</span>
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
                        {existingRule && selectedDates.length === 1 && (
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                                onClick={handleDelete}
                                disabled={isSaving || isDeleting}
                            >
                                <Trash2 className="h-4 w-4" />
                                {isDeleting ? "Removendo..." : "Limpar Regra"}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="hover:cursor-pointer w-full sm:w-auto"
                            onClick={onClose}
                            disabled={isSaving || isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-yellow-primary hover:bg-yellow-secondary text-black hover:cursor-pointer w-full sm:w-auto font-semibold"
                            onClick={handleSave}
                            disabled={isSaving || isDeleting}
                        >
                            {isSaving ? "Salvando..." : "Confirmar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
