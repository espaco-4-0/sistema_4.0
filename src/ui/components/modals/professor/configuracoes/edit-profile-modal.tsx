"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { User } from "lucide-react";

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onOpenChange, onClose }: Readonly<EditProfileModalProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-yellow-600" />
                        </div>
                        <Button variant="outline" size="sm">
                            Alterar Foto
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nome</Label>
                            <Input defaultValue="Renata" />
                        </div>
                        <div>
                            <Label>Sobrenome</Label>
                            <Input defaultValue="Imaculada" />
                        </div>
                    </div>

                    <div>
                        <Label>E-mail</Label>
                        <Input type="email" defaultValue="Renata@ifal.edu.com.br" />
                    </div>

                    <div>
                        <Label>Cargo</Label>
                        <Input defaultValue="Administrador do Sistema" />
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button variant="outline" className="flex-1 hover:cursor-pointer" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer">Salvar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
