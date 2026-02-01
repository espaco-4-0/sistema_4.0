"use client";

import { useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

import { DatePicker } from "../../../ui/date-picker";

interface CreateCampaignModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onOpenChange, onClose }: Readonly<CreateCampaignModalProps>) {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="border border-yellow-200">
                <DialogHeader>
                    <DialogTitle className="text-black">Criar campanha</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="campaign-name">Nome da campanha</Label>
                        <Input id="campaign-name" placeholder="Ex.: Desafio de Inovação" />
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
                            <DatePicker
                                date={startDate}
                                onDateChange={setStartDate}
                                placeholder="Selecione a data de início"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Data de término</Label>
                            <DatePicker
                                date={endDate}
                                onDateChange={setEndDate}
                                placeholder="Selecione a data de término"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" placeholder="Descreva o objetivo e as regras" />
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border text-black hover:bg-gray-50"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500">
                            Criar campanha
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
