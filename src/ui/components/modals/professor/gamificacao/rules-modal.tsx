"use client";

import { useState } from "react";
import { EVENT_LABELS, type GamificationRule } from "@/src/infra/modules/professor/gamification-admin.service";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { useGamificationRules, useSaveRules } from "@/src/ui/modules/teacher_pages/queries/gamification.queries";
import { Loader2 } from "lucide-react";

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: Readonly<RulesModalProps>) {
    const { data: rules = [], isLoading } = useGamificationRules();
    const saveMutation = useSaveRules();

    const [draft, setDraft] = useState<GamificationRule[]>([]);

    // Recarrega o rascunho a cada abertura, a partir do que está salvo.
    const [wasOpen, setWasOpen] = useState(false);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) setDraft(rules);
    }

    // Enquanto a query não resolveu, o rascunho pode estar vazio.
    const linhas = draft.length > 0 ? draft : rules;

    function update(event: string, patch: Partial<GamificationRule>) {
        setDraft(linhas.map((rule) => (rule.event === event ? { ...rule, ...patch } : rule)));
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Regras de pontuação</DialogTitle>
                    <DialogDescription>
                        Defina quanto cada ação vale. Eventos desativados não pontuam.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Carregando regras...
                    </div>
                ) : (
                    <div className="space-y-2 py-2 max-h-[55vh] overflow-y-auto">
                        <div className="grid grid-cols-12 gap-3 px-3 pb-1 text-xs font-semibold text-gray-500 uppercase">
                            <span className="col-span-6">Evento</span>
                            <span className="col-span-2">XP</span>
                            <span className="col-span-2">Pontos</span>
                            <span className="col-span-2">Ativo</span>
                        </div>

                        {linhas.map((rule) => (
                            <div key={rule.event} className="grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-lg p-3">
                                <span className="col-span-6 text-sm text-gray-800">
                                    {EVENT_LABELS[rule.event] ?? rule.event}
                                </span>

                                <Input
                                    className="col-span-2 h-9"
                                    type="number"
                                    min={0}
                                    aria-label={`XP para ${EVENT_LABELS[rule.event]}`}
                                    value={rule.xp}
                                    onChange={(e) => update(rule.event, { xp: Number(e.target.value) || 0 })}
                                />

                                <Input
                                    className="col-span-2 h-9"
                                    type="number"
                                    min={0}
                                    aria-label={`Pontos para ${EVENT_LABELS[rule.event]}`}
                                    value={rule.points}
                                    onChange={(e) => update(rule.event, { points: Number(e.target.value) || 0 })}
                                />

                                <div className="col-span-2 flex justify-center">
                                    <Checkbox
                                        aria-label={`Ativar ${EVENT_LABELS[rule.event]}`}
                                        checked={rule.isActive}
                                        onCheckedChange={(checked) => update(rule.event, { isActive: checked === true })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => saveMutation.mutate(linhas, { onSuccess: () => onClose() })}
                        disabled={saveMutation.isPending || linhas.length === 0}
                        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    >
                        {saveMutation.isPending ? "Salvando..." : "Salvar regras"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
