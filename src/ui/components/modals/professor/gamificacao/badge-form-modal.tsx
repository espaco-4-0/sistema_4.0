"use client";

import { useState } from "react";
import { CRITERIA_LABELS, type BadgeAdminItem } from "@/src/infra/modules/professor/gamification-admin.service";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { useCreateBadge, useUpdateBadge } from "@/src/ui/modules/teacher_pages/queries/gamification.queries";
import { toast } from "sonner";

const CRITERIA = ["MANUAL", "XP_TOTAL", "PRESENCE_COUNT", "COURSE_COUNT", "PROJECT_COUNT", "TASK_COUNT"];

interface BadgeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    badgeToEdit?: BadgeAdminItem | null;
}

export function BadgeFormModal({ isOpen, onClose, badgeToEdit }: Readonly<BadgeFormModalProps>) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [points, setPoints] = useState("0");
    const [criteria, setCriteria] = useState("MANUAL");
    const [criteriaValue, setCriteriaValue] = useState("");
    const [isActive, setIsActive] = useState(true);

    const createMutation = useCreateBadge();
    const updateMutation = useUpdateBadge();
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const formKey = isOpen ? (badgeToEdit?.id ?? "new") : null;
    const [lastFormKey, setLastFormKey] = useState<string | null>(null);

    if (formKey !== lastFormKey) {
        setLastFormKey(formKey);

        if (formKey !== null) {
            setName(badgeToEdit?.name ?? "");
            setDescription(badgeToEdit?.description ?? "");
            setPoints(String(badgeToEdit?.points ?? 0));
            setCriteria(badgeToEdit?.criteria ?? "MANUAL");
            setCriteriaValue(badgeToEdit?.criteriaValue ? String(badgeToEdit.criteriaValue) : "");
            setIsActive(badgeToEdit?.isActive ?? true);
        }
    }

    const exigeValor = criteria !== "MANUAL";

    function handleSubmit() {
        if (name.trim().length < 3) {
            toast.error("O nome precisa de ao menos 3 caracteres.");
            return;
        }

        if (exigeValor && (!criteriaValue || Number(criteriaValue) <= 0)) {
            toast.error("Critérios automáticos exigem um valor limite maior que zero.");
            return;
        }

        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            points: Number(points) || 0,
            criteria,
            criteriaValue: exigeValor ? Number(criteriaValue) : null,
            isActive,
        };

        const onDone = { onSuccess: () => onClose() };

        if (badgeToEdit) {
            updateMutation.mutate({ id: badgeToEdit.id, payload }, onDone);
        } else {
            createMutation.mutate(payload, onDone);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{badgeToEdit ? "Editar badge" : "Nova badge"}</DialogTitle>
                    <DialogDescription>
                        Badges com critério automático são concedidas sozinhas quando o aluno atinge o limite.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="badge-nome">Nome *</Label>
                        <Input
                            id="badge-nome"
                            placeholder="Ex: Presença de Ouro"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="badge-desc">Descrição</Label>
                        <textarea
                            id="badge-desc"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="O que o aluno precisa fazer para conquistar"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Critério *</Label>
                            <Select value={criteria} onValueChange={setCriteria}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRITERIA.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {CRITERIA_LABELS[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="badge-valor">
                                {exigeValor ? "Valor limite *" : "Valor limite"}
                            </Label>
                            <Input
                                id="badge-valor"
                                type="number"
                                min={1}
                                disabled={!exigeValor}
                                placeholder={exigeValor ? "Ex: 10" : "Não se aplica"}
                                value={criteriaValue}
                                onChange={(e) => setCriteriaValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-1">
                            <Label htmlFor="badge-pontos">Pontos concedidos</Label>
                            <Input
                                id="badge-pontos"
                                type="number"
                                min={0}
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                            />
                        </div>

                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700 pb-2">
                            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
                            Badge ativa
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    >
                        {isSubmitting ? "Salvando..." : badgeToEdit ? "Salvar" : "Criar badge"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
