import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

interface ImportarRecursoProps {
    open: boolean;
    onClose: () => void;
}

export function ImportarRecurso({ open, onClose }: ImportarRecursoProps) {
    const [formData, setFormData] = useState({
        nome: "",
        categoria: "",
        qtdTotal: "",
        localizacao: "",
        disponivel: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting resource:", formData);
        onClose();
        setFormData({
            nome: "",
            categoria: "",
            qtdTotal: "",
            localizacao: "",
            disponivel: "",
        });
    };

    const handleCancel = () => {
        setFormData({
            nome: "",
            categoria: "",
            qtdTotal: "",
            localizacao: "",
            disponivel: "",
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-125 p-0">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </button>

                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Adicionar Novo Recurso</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Preencha os dados para cadastrar um novo recurso no sistema.
                            </p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                                    Nome do Recurso *
                                </Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Ex: Arduino Uno R3"
                                    value={formData.nome}
                                    onChange={(e) => handleChange("nome", e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
                                    Categoria *
                                </Label>
                                <Input
                                    id="categoria"
                                    type="text"
                                    placeholder="Ex: Microcontroladores"
                                    value={formData.categoria}
                                    onChange={(e) => handleChange("categoria", e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qtdTotal" className="text-sm font-medium text-gray-700">
                                        Qtd. Total *
                                    </Label>
                                    <Input
                                        id="qtdTotal"
                                        type="number"
                                        placeholder="0"
                                        value={formData.qtdTotal}
                                        onChange={(e) => handleChange("qtdTotal", e.target.value)}
                                        required
                                        min="0"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="disponivel" className="text-sm font-medium text-gray-700">
                                        Disponível *
                                    </Label>
                                    <Input
                                        id="disponivel"
                                        type="number"
                                        placeholder="0"
                                        value={formData.disponivel}
                                        onChange={(e) => handleChange("disponivel", e.target.value)}
                                        required
                                        min="0"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="localizacao" className="text-sm font-medium text-gray-700">
                                    Localização *
                                </Label>
                                <Input
                                    id="localizacao"
                                    type="text"
                                    placeholder="Ex: Prateleira A1"
                                    value={formData.localizacao}
                                    onChange={(e) => handleChange("localizacao", e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Dica:</span> Certifique-se de que todos os campos
                                    estão preenchidos corretamente antes de salvar.
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                            className="text-gray-700 hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 font-medium"
                        >
                            Adicionar Recurso
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
