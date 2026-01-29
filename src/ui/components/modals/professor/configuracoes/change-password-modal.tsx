"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onOpenChange, onClose }: ChangePasswordModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div>
                        <Label>Senha Atual</Label>
                        <Input type="password" placeholder="Digite sua senha atual" />
                    </div>

                    <div>
                        <Label>Nova Senha</Label>
                        <Input type="password" placeholder="Digite a nova senha" />
                        <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                    </div>

                    <div>
                        <Label>Confirmar Nova Senha</Label>
                        <Input type="password" placeholder="Confirme a nova senha" />
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
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Alterar Senha</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
