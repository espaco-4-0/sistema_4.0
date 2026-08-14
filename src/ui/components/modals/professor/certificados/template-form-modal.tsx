"use client";

import { useState } from "react";
import { CERTIFICATE_TYPE_LABELS } from "@/src/infra/modules/professor/certificates.service";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { useCreateTemplate } from "@/src/ui/modules/teacher_pages/queries/certificates.queries";
import { toast } from "sonner";

const TYPES = ["PARTICIPATION", "COMPLETION", "EXCELLENCE"];

const DEFAULT_LAYOUT = {
    corFundo: "#FFFDF0",
    corTitulo: "#1A1A1A",
    corNome: "#B89614",
    corTexto: "#4A4A4A",
    corBorda: "#B89614",
};

interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TemplateFormModal({ isOpen, onClose }: Readonly<TemplateFormModalProps>) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [tipo, setTipo] = useState("PARTICIPATION");
    const [cargaHoraria, setCargaHoraria] = useState("");
    const [corFundo, setCorFundo] = useState(DEFAULT_LAYOUT.corFundo);
    const [corBorda, setCorBorda] = useState(DEFAULT_LAYOUT.corBorda);

    const createMutation = useCreateTemplate();

    const [wasOpen, setWasOpen] = useState(false);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setTitulo("");
            setDescricao("");
            setTipo("PARTICIPATION");
            setCargaHoraria("");
            setCorFundo(DEFAULT_LAYOUT.corFundo);
            setCorBorda(DEFAULT_LAYOUT.corBorda);
        }
    }

    function handleSubmit() {
        if (titulo.trim().length < 3) {
            toast.error("O título precisa de ao menos 3 caracteres.");
            return;
        }
        if (descricao.trim().length < 10) {
            toast.error("A descrição precisa de ao menos 10 caracteres.");
            return;
        }

        createMutation.mutate(
            {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                tipo,
                ...(cargaHoraria ? { cargaHoraria: Number(cargaHoraria) } : {}),
                layout: { ...DEFAULT_LAYOUT, corFundo, corBorda },
            },
            { onSuccess: () => onClose() }
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Novo template</DialogTitle>
                    <DialogDescription>
                        Defina o modelo usado na emissão. As cores aparecem no PDF gerado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label htmlFor="tpl-titulo">Título *</Label>
                        <Input
                            id="tpl-titulo"
                            placeholder="Ex: Participação Geral"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="tpl-descricao">Descrição *</Label>
                        <textarea
                            id="tpl-descricao"
                            rows={2}
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Texto que aparece no corpo do certificado"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Tipo *</Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {CERTIFICATE_TYPE_LABELS[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="tpl-carga">Carga horária (h)</Label>
                            <Input
                                id="tpl-carga"
                                type="number"
                                min={1}
                                value={cargaHoraria}
                                onChange={(e) => setCargaHoraria(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="tpl-fundo">Cor de fundo</Label>
                            <Input
                                id="tpl-fundo"
                                type="color"
                                className="h-10 p-1"
                                value={corFundo}
                                onChange={(e) => setCorFundo(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="tpl-borda">Cor da borda</Label>
                            <Input
                                id="tpl-borda"
                                type="color"
                                className="h-10 p-1"
                                value={corBorda}
                                onChange={(e) => setCorBorda(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    >
                        {createMutation.isPending ? "Criando..." : "Criar template"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
