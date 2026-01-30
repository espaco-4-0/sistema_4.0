"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

interface CreateCampaignModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onOpenChange, onClose }: Readonly<CreateCampaignModalProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="border border-yellow-200">
                <DialogHeader>
                    <DialogTitle className="text-black">Criar campanha</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label>Nome da campanha</Label>
                        <Input placeholder="Ex.: Desafio de Inovação" />
                    </div>

                    <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select defaultValue="pontos">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pontos">Pontos</SelectItem>
                                <SelectItem value="badges">Badges</SelectItem>
                                <SelectItem value="premios">Prêmios</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Data de início</Label>
                            <Input type="date" />
                        </div>
                        <div className="space-y-1">
                            <Label>Data de término</Label>
                            <Input type="date" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Descrição</Label>
                        <Textarea placeholder="Descreva o objetivo e as regras" />
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border text-black hover:bg-gray-50 hover:cursor-pointer"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-yellow-400 text-black hover:cursor-pointer hover:bg-yellow-500">
                            Criar campanha
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
