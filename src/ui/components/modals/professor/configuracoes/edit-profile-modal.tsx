"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { User } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
    id: string;
    nomeCompleto: string;
    email: string;
    role: string;
    avatarUrl: string | null;
} | null;

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    profile: ProfileData;
    onSaved?: () => void;
}

function splitName(fullName: string) {
    const chunks = fullName.trim().split(/\s+/);
    if (chunks.length <= 1) {
        return { firstName: fullName, lastName: "" };
    }
    return {
        firstName: chunks[0],
        lastName: chunks.slice(1).join(" "),
    };
}

function roleLabel(role: string): string {
    const map: Record<string, string> = {
        ADMIN: "Administrador do Sistema",
        PROFESSOR: "Professor",
        MONITOR: "Monitor",
        PESQUISADOR: "Pesquisador",
        VISITANTE: "Visitante",
    };
    return map[role] ?? role;
}

export function EditProfileModal({ isOpen, onOpenChange, onClose, profile, onSaved }: Readonly<EditProfileModalProps>) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fullName = profile?.nomeCompleto ?? "";
        const names = splitName(fullName);
        setFirstName(names.firstName);
        setLastName(names.lastName);
        setEmail(profile?.email ?? "");
        setAvatarUrl(profile?.avatarUrl ?? "");
    }, [profile, isOpen]);

    async function handleSave() {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

        if (!fullName || !email.trim()) {
            toast.error("Nome e e-mail são obrigatórios");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                nomeCompleto: fullName,
                email: email.trim(),
                avatarUrl: avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
            };

            const response = await fetch("/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const body = (await response.json().catch(() => null)) as { message?: string } | null;

            if (!response.ok) {
                toast.error(body?.message ?? "Não foi possível atualizar o perfil");
                return;
            }

            toast.success("Perfil atualizado com sucesso");
            onSaved?.();
            onClose();
        } catch {
            toast.error("Erro de conexão ao atualizar perfil");
        } finally {
            setIsSaving(false);
        }
    }

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
                        <div className="w-full">
                            <Label>URL da foto</Label>
                            <Input
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nome</Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Sobrenome</Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <Label>E-mail</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                        <Label>Cargo</Label>
                        <Input value={roleLabel(profile?.role ?? "")} disabled />
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
                            className="flex-1 bg-yellow-primary hover:bg-yellow-secondary text-black hover:cursor-pointer"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
