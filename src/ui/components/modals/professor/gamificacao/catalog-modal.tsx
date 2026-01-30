"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

interface CatalogModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
}

export function CatalogModal({ isOpen, onOpenChange, onClose }: Readonly<CatalogModalProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="border border-yellow-200">
                <DialogHeader>
                    <DialogTitle className="text-black">Catálogo de prêmios</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <Input placeholder="Buscar prêmio" />

                    <div className="space-y-3">
                        {[
                            { name: "Kit Maker Lab", points: "1.200 pts", stock: "12" },
                            { name: "Curso Premium", points: "900 pts", stock: "25" },
                            { name: "Mentoria Individual", points: "700 pts", stock: "8" },
                        ].map((item) => (
                            <div key={item.name} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">Disponível para resgate</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-yellow-100 text-black hover:bg-yellow-200"
                                    >
                                        Editar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label className="text-xs">Pontos</Label>
                                        <Input defaultValue={item.points} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Estoque</Label>
                                        <Input defaultValue={item.stock} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Status</Label>
                                        <Select defaultValue="ativo">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="pausado">Pausado</SelectItem>
                                                <SelectItem value="encerrado">Encerrado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-900">Adicionar prêmio</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Nome do prêmio</Label>
                                <Input placeholder="Ex.: Voucher de livros" />
                            </div>
                            <div className="space-y-1">
                                <Label>Pontos necessários</Label>
                                <Input type="number" placeholder="Ex.: 500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Estoque inicial</Label>
                                <Input type="number" placeholder="Ex.: 30" />
                            </div>
                            <div className="space-y-1">
                                <Label>Categoria</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cursos">Cursos</SelectItem>
                                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                                        <SelectItem value="mentorias">Mentorias</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Descrição</Label>
                            <Textarea placeholder="Detalhes do prêmio para os alunos" />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border hover:cursor-pointer text-black hover:bg-gray-50"
                            onClick={onClose}
                        >
                            Fechar
                        </Button>
                        <Button className="flex-1 bg-yellow-400 text-black hover:cursor-pointer hover:bg-yellow-500">
                            Salvar alterações
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
