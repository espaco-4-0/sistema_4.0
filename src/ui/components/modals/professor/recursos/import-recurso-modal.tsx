import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateResource, useUpdateResource } from "@/src/ui/modules/teacher_pages/queries/resources.queries";

import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

interface ImportarRecursoProps {
    open: boolean;
    onClose: () => void;
    resourceToEdit?: any;
}

export function ImportarRecurso({ open, onClose, resourceToEdit }: Readonly<ImportarRecursoProps>) {
    const [formData, setFormData] = useState({
        nome: "",
        categoria: "",
        qtdTotal: "",
        localizacao: "",
        disponivel: "",
        description: "",
    });

    const createMutation = useCreateResource();
    const updateMutation = useUpdateResource();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (resourceToEdit) {
                setFormData({
                    nome: resourceToEdit.name || "",
                    categoria: resourceToEdit.category || "",
                    qtdTotal: String(resourceToEdit.quantity || 0),
                    localizacao: resourceToEdit.location || "",
                    disponivel: String(resourceToEdit.quantity || 0),
                    description: resourceToEdit.description || "",
                });
            } else {
                setFormData({
                    nome: "",
                    categoria: "",
                    qtdTotal: "",
                    localizacao: "",
                    disponivel: "",
                    description: "",
                });
            }
        }
    }, [resourceToEdit, open]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.nome,
            category: formData.categoria,
            quantity: Number(formData.qtdTotal),
            location: formData.localizacao,
            description: formData.description || undefined,
            unit: "un",
        };

        if (resourceToEdit) {
            updateMutation.mutate(
                { id: resourceToEdit.id, data: payload },
                {
                    onSuccess: () => {
                        onClose();
                    },
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-125 p-0 bg-white">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 hover:cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </button>

                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                {resourceToEdit ? "Editar Recurso" : "Adicionar Novo Recurso"}
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {resourceToEdit
                                    ? "Modifique os dados do recurso abaixo."
                                    : "Preencha os dados para cadastrar um novo recurso no sistema."}
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
                                    className="w-full border-gray-200"
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
                                    className="w-full border-gray-200"
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
                                        onChange={(e) => {
                                            handleChange("qtdTotal", e.target.value);
                                            handleChange("disponivel", e.target.value);
                                        }}
                                        required
                                        min="0"
                                        className="w-full border-gray-200"
                                    />
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
                                        className="w-full border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    Descrição
                                </Label>
                                <textarea
                                    id="description"
                                    placeholder="Detalhes adicionais sobre o recurso..."
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-400 min-h-20"
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
                            disabled={isSubmitting}
                            className="text-gray-700 hover:cursor-pointer hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#FFC107] hover:bg-[#FFB300] hover:cursor-pointer text-gray-900 font-medium flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                            {resourceToEdit ? "Salvar Alterações" : "Adicionar Recurso"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

