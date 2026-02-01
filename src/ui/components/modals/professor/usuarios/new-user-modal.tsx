"use client";

import { Button } from "@/src/ui/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Lock, Mail, User, UserPlus } from "lucide-react";

interface NewUserModalProps {
    isOpen: boolean;
    handleOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export default function NewUserModal({ isOpen, handleOpenChange, onClose }: Readonly<NewUserModalProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-160 p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-xl">
                <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        Criar Nova Conta de Usuário
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 max-w-xl">
                        Preencha os dados abaixo para criar uma nova conta de acesso ao sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-8 space-y-5">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Nome Completo</p>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input className="pl-10 h-11" placeholder="Digite o nome completo do usuário" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">E-mail Institucional</p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input className="pl-10 h-11" placeholder="usuario@ifal.edu.br" />
                        </div>
                        <p className="text-xs text-gray-400">* Apenas e-mails @ifal.edu.br são aceitos</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Tipo de Usuário</p>
                        <Select>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione o tipo de usuário" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professor">Professor</SelectItem>
                                <SelectItem value="pesquisador">Pesquisador</SelectItem>
                                <SelectItem value="monitor">Monitor</SelectItem>
                                <SelectItem value="visitante">Visitante</SelectItem>
                                <SelectItem value="aluno">Aluno</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Senha Temporária</p>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input type="password" className="pl-10 h-11" placeholder="Digite uma senha" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Confirmar Senha</p>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input type="password" className="pl-10 h-11" placeholder="Confirme a senha" />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 py-5 hover:cursor-pointer border bg-gray-50 border-t flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} className="h-11 px-6 hover:cursor-pointer text-gray-600">
                        Cancelar
                    </Button>

                    <Button className="h-11 px-8 gap-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 shadow hover:cursor-pointer">
                        <UserPlus className="h-4 w-4" />
                        Criar Usuário
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
