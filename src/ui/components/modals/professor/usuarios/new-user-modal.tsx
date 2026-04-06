"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface NewUserModalProps {
    isOpen: boolean;
    handleOpenChange: (open: boolean) => void;
    onClose: () => void;
    onUserCreated?: () => void;
}

const roleOptions = [
    { value: "PROFESSOR", label: "Professor" },
    { value: "PESQUISADOR", label: "Pesquisador" },
    { value: "MONITOR", label: "Monitor" },
    { value: "VISITANTE", label: "Visitante" },
    { value: "ADMIN", label: "Administrador" },
] as const;

export default function NewUserModal({
    isOpen,
    handleOpenChange,
    onClose,
    onUserCreated,
}: Readonly<NewUserModalProps>) {
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<(typeof roleOptions)[number]["value"]>("VISITANTE");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setNomeCompleto("");
        setEmail("");
        setRole("VISITANTE");
        setSenha("");
        setConfirmSenha("");
    }

    async function handleCreateUser() {
        if (!nomeCompleto.trim() || !email.trim() || !senha || !confirmSenha) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        if (senha !== confirmSenha) {
            toast.error("As senhas não coincidem");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                nomeCompleto: nomeCompleto.trim(),
                email: email.trim(),
                senha,
                role,
                dataNascimento: "2000-01-01",
                telefone: "(00) 00000-0000",
                raca: "NAO_INFORMADA",
                educacao: "MEDIO_COMPLETO",
                ifalAfiliacao: "NAO_ALUNO",
                ativo: true,
            };

            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const body = (await response.json().catch(() => null)) as { message?: string } | null;

            if (!response.ok) {
                toast.error(body?.message ?? "Não foi possível criar o usuário");
                return;
            }

            toast.success("Usuário criado com sucesso");
            resetForm();
            onUserCreated?.();
            onClose();
        } catch {
            toast.error("Erro de conexão ao criar usuário");
        } finally {
            setIsSubmitting(false);
        }
    }

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
                            <Input
                                className="pl-10 h-11"
                                placeholder="Digite o nome completo do usuário"
                                value={nomeCompleto}
                                onChange={(e) => setNomeCompleto(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">E-mail Institucional</p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                className="pl-10 h-11"
                                placeholder="usuario@ifal.edu.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400">* Apenas e-mails @ifal.edu.br são aceitos</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Tipo de Usuário</p>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as (typeof roleOptions)[number]["value"])}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione o tipo de usuário" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Senha Temporária</p>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="password"
                                    className="pl-10 h-11"
                                    placeholder="Digite uma senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Confirmar Senha</p>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="password"
                                    className="pl-10 h-11"
                                    placeholder="Confirme a senha"
                                    value={confirmSenha}
                                    onChange={(e) => setConfirmSenha(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 py-5 hover:cursor-pointer border bg-gray-50 border-t flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="h-11 px-6 hover:cursor-pointer text-gray-600"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleCreateUser}
                        className="h-11 px-8 gap-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 shadow hover:cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <UserPlus className="h-4 w-4" />
                        {isSubmitting ? "Criando..." : "Criar Usuário"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
