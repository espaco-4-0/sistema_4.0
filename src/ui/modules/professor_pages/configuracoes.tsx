"use client";

import { useState } from "react";
import { mockConfig } from "@/src/infra/modules/professor/configuracoes-mock";
import { ChangePasswordModal } from "@/src/ui/components/modals/professor/configuracoes/change-password-modal";
import { EditProfileModal } from "@/src/ui/components/modals/professor/configuracoes/edit-profile-modal";
import { EditSystemModal } from "@/src/ui/components/modals/professor/configuracoes/edit-system-modal";
import { Badge } from "@/src/ui/components/ui/badge";
import { Button } from "@/src/ui/components/ui/button";
import { Switch } from "@/src/ui/components/ui/switch";
import { Lock, Settings, Shield, User } from "lucide-react";

type ModalType = "editProfile" | "editSystem" | "changePassword" | null;

export default function Configuracoes() {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const handleModalChange = (open: boolean) => {
        if (!open) {
            setActiveModal(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-linear-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-yellow-500" />
                            </div>
                            <div className="text-black">
                                <h2 className="text-xl font-bold">Renata Imaculada</h2>
                                <p className="text-sm opacity-90">Renata@ifal.edu.com.br</p>
                            </div>
                        </div>
                        <Button
                            className="bg-white text-black hover:cursor-pointer hover:bg-gray-50"
                            onClick={() => setActiveModal("editProfile")}
                        >
                            <Settings className="w-4 h-4" />
                            Editar Perfil
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {mockConfig.map((item) => {
                        const Icon = item.icon;
                        const iconColor = item.iconColor ?? "text-gray-700";
                        const value = typeof item.value === "number" ? item.value.toLocaleString("pt-BR") : item.value;

                        return (
                            <div key={item.title} className="bg-white rounded-lg p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}
                                    >
                                        <Icon className={`w-5 h-5 ${iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{item.title}</p>
                                        <p className="text-xl font-bold text-gray-900">{value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="font-bold text-gray-900">Sistema</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Nome do Sistema</p>
                                    <p className="text-gray-900 font-medium mt-1">Sistema do Espaco 4.0</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setActiveModal("editSystem")}>
                                    Editar
                                </Button>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Instituição</p>
                                    <p className="text-gray-900 font-medium mt-1">
                                        Instituto Federal de Alagoas Campus Arapiraca
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setActiveModal("editSystem")}>
                                    Editar
                                </Button>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Versão</p>
                                    <p className="text-gray-900 font-medium mt-1">2.5.1</p>
                                </div>
                                <Badge variant="success">Atualizado</Badge>
                            </div>

                            <div className="flex justify-between items-center py-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Modo Manutenção</p>
                                    <p className="text-sm text-gray-600 mt-1">Sistema disponível</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="font-bold text-gray-900">Segurança</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Autenticação 2FA</p>
                                    <p className="text-sm text-gray-600 mt-1">Proteção adicional</p>
                                </div>
                                <Badge variant="success">
                                    <Lock className="w-3 h-3" />
                                    Ativado
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Última Alteração</p>
                                    <p className="text-gray-900 font-medium mt-1">15/01/2025</p>
                                </div>
                                <Button
                                    className="hover:cursor-pointer"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveModal("changePassword")}
                                >
                                    Alterar Senha
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" className="hover:cursor-pointer border">
                        Cancelar
                    </Button>
                    <Button className="bg-yellow-primary text-black hover:bg-yellow-secondary hover:cursor-pointer">
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <EditProfileModal
                isOpen={activeModal === "editProfile"}
                onOpenChange={handleModalChange}
                onClose={() => setActiveModal(null)}
            />

            <EditSystemModal
                isOpen={activeModal === "editSystem"}
                onOpenChange={handleModalChange}
                onClose={() => setActiveModal(null)}
            />

            <ChangePasswordModal
                isOpen={activeModal === "changePassword"}
                onOpenChange={handleModalChange}
                onClose={() => setActiveModal(null)}
            />
        </div>
    );
}
