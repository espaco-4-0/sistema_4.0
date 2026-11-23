"use client";

import { useRef, useState } from "react";
import type { SignatureData } from "@/src/infra/modules/professor/certificates.service";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { useSaveSignature } from "@/src/ui/modules/teacher_pages/queries/certificates.queries";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    signature: SignatureData | null;
}

export function SignatureModal({ isOpen, onClose, signature }: Readonly<SignatureModalProps>) {
    const [responsibleName, setResponsibleName] = useState("");
    const [role, setRole] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const saveMutation = useSaveSignature();

    // Recarrega os dados salvos a cada abertura.
    const [wasOpen, setWasOpen] = useState(false);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setResponsibleName(signature?.responsibleName ?? "");
            setRole(signature?.role ?? "");
            setFile(null);
        }
    }

    function handleFile(selected: File | undefined) {
        if (!selected) return;

        if (!ALLOWED.includes(selected.type)) {
            toast.error("Formato inválido. Use PNG, JPEG ou WebP.");
            return;
        }
        if (selected.size > MAX_BYTES) {
            toast.error("A imagem deve ter no máximo 2MB.");
            return;
        }

        setFile(selected);
    }

    function handleSubmit() {
        if (responsibleName.trim().length < 3) {
            toast.error("Informe o nome do responsável.");
            return;
        }
        if (role.trim().length < 2) {
            toast.error("Informe o cargo.");
            return;
        }
        if (!signature && !file) {
            toast.error("Envie a imagem da assinatura.");
            return;
        }

        saveMutation.mutate(
            { responsibleName: responsibleName.trim(), role: role.trim(), file: file ?? undefined },
            { onSuccess: () => onClose() }
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assinatura do responsável</DialogTitle>
                    <DialogDescription>
                        Aplicada nos certificados que você emitir. A imagem é opcional na edição.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="sig-nome">Nome do responsável *</Label>
                        <Input
                            id="sig-nome"
                            placeholder="Ex: Ana Costa"
                            value={responsibleName}
                            onChange={(e) => setResponsibleName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sig-cargo">Cargo *</Label>
                        <Input
                            id="sig-cargo"
                            placeholder="Ex: Coordenadora Acadêmica"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Imagem da assinatura {signature ? "" : "*"}</Label>

                        {signature?.signatureImageUrl && !file ? (
                            <div className="border rounded-lg p-3 bg-gray-50">
                                <img
                                    src={signature.signatureImageUrl}
                                    alt="Assinatura atual"
                                    className="h-16 object-contain"
                                />
                            </div>
                        ) : null}

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4" /> Escolher imagem
                            </Button>
                            <span className="text-xs text-gray-500 truncate">
                                {file ? file.name : "PNG, JPEG ou WebP até 2MB"}
                            </span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saveMutation.isPending}
                        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    >
                        {saveMutation.isPending ? "Salvando..." : "Salvar assinatura"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
