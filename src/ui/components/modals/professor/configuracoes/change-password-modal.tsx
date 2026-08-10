"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

const MIN_LENGTH = 6;

export function ChangePasswordModal({ isOpen, onOpenChange, onClose }: Readonly<ChangePasswordModalProps>) {
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Limpa os campos a cada abertura para não deixar senha digitada em memória.
    const [wasOpen, setWasOpen] = useState(false);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
        }
    }

    async function handleSubmit() {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            toast.error("Preencha todos os campos");
            return;
        }

        if (novaSenha.length < MIN_LENGTH) {
            toast.error(`A nova senha deve ter no mínimo ${MIN_LENGTH} caracteres`);
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error("As senhas não coincidem");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/profile/me/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senhaAtual, novaSenha, confirmarSenha }),
            });

            const body = (await response.json().catch(() => null)) as { message?: string } | null;

            if (!response.ok) {
                toast.error(body?.message ?? "Não foi possível alterar a senha");
                return;
            }

            toast.success("Senha alterada com sucesso");
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
            onClose();
        } catch {
            toast.error("Erro de conexão ao alterar a senha");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div>
                        <Label htmlFor="senha-atual">Senha Atual</Label>
                        <Input
                            id="senha-atual"
                            type="password"
                            placeholder="Digite sua senha atual"
                            value={senhaAtual}
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div>
                        <Label htmlFor="nova-senha">Nova Senha</Label>
                        <Input
                            id="nova-senha"
                            type="password"
                            placeholder="Digite a nova senha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            autoComplete="new-password"
                        />
                        <p className="text-xs text-gray-500 mt-1">Mínimo {MIN_LENGTH} caracteres</p>
                    </div>

                    <div>
                        <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                        <Input
                            id="confirmar-senha"
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-900 text-sm mb-2">Dicas de Segurança</p>
                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                            <li>Use uma senha única</li>
                            <li>Não compartilhe sua senha</li>
                            <li>Use letras, números e símbolos</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 hover:cursor-pointer"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer gap-2"
                            onClick={handleSubmit}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? "Alterando..." : "Alterar Senha"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
