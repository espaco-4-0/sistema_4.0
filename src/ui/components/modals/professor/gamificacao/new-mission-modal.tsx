"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

interface NewMissionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function NewMissionModal({ isOpen, onOpenChange, onClose }: NewMissionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="border border-yellow-200">
                <DialogHeader>
                    <DialogTitle className="text-black">Nova missão</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label>Nome da missão</Label>
                        <Input placeholder="Ex.: Desafio semanal" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Pontos</Label>
                            <Input type="number" placeholder="Ex.: 150" />
                        </div>
                        <div className="space-y-1">
                            <Label>Dificuldade</Label>
                            <Select defaultValue="media">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facil">Fácil</SelectItem>
                                    <SelectItem value="media">Média</SelectItem>
                                    <SelectItem value="dificil">Difícil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Descrição</Label>
                        <Textarea placeholder="Explique a missão e critérios de conclusão" />
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border text-black hover:bg-gray-50 hover:cursor-pointer"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-yellow-400 hover:cursor-pointer text-black hover:bg-yellow-500">
                            Criar missão
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
