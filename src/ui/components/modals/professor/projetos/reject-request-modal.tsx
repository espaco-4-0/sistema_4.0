"use client";

import { useState } from "react";
import type { ProjectRequestItem } from "@/src/infra/modules/professor/projects-admin.service";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Label } from "@/src/ui/components/ui/label";
import { useRejectRequest } from "@/src/ui/modules/teacher_pages/queries/projects.queries";
import { toast } from "sonner";

const MIN_REASON = 10;

interface RejectRequestModalProps {
    request: ProjectRequestItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function RejectRequestModal({ request, isOpen, onClose }: Readonly<RejectRequestModalProps>) {
    const [reason, setReason] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const rejectMutation = useRejectRequest();

    // Limpa os campos a cada solicitação aberta.
    const [lastId, setLastId] = useState<string | null>(null);
    const currentId = isOpen ? (request?.id ?? null) : null;
    if (currentId !== lastId) {
        setLastId(currentId);
        setReason("");
        setObservacoes("");
    }

    function handleSubmit() {
        if (!request) return;

        if (reason.trim().length < MIN_REASON) {
            toast.error(`O motivo precisa de ao menos ${MIN_REASON} caracteres.`);
            return;
        }

        rejectMutation.mutate(
            { id: request.id, reason: reason.trim(), observacoes: observacoes.trim() || undefined },
            { onSuccess: () => onClose() }
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Rejeitar solicitação</DialogTitle>
                    <DialogDescription>
                        O aluno poderá corrigir e reenviar. O motivo é obrigatório e ficará visível para ele.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{request?.title}</p>

                    <div className="space-y-1">
                        <Label htmlFor="reject-reason">Motivo *</Label>
                        <textarea
                            id="reject-reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explique o que precisa ser ajustado"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="reject-notes">Observações</Label>
                        <textarea
                            id="reject-notes"
                            rows={2}
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Opcional"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={rejectMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rejectMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {rejectMutation.isPending ? "Rejeitando..." : "Rejeitar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
