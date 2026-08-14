"use client";

import { useRef, useState } from "react";
import {
    DEFAULT_LAYOUT,
    ELEMENT_KEYS,
    ELEMENT_LABELS,
    type CertificateLayoutV2,
    type ElementKey,
} from "@/src/infra/modules/certificates/layout";
import {
    CERTIFICATE_TYPE_LABELS,
    uploadBackground,
    type CertificateTemplateItem,
} from "@/src/infra/modules/professor/certificates.service";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { useCreateTemplate, useUpdateTemplate } from "@/src/ui/modules/teacher_pages/queries/certificates.queries";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { CertificateCanvas } from "./certificate-canvas";

const TYPES = ["PARTICIPATION", "COMPLETION", "EXCELLENCE"];
const ALIGNMENTS: { value: "left" | "center" | "right"; label: string }[] = [
    { value: "left", label: "Esquerda" },
    { value: "center", label: "Centro" },
    { value: "right", label: "Direita" },
];

interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateToEdit?: CertificateTemplateItem | null;
}

export function TemplateFormModal({ isOpen, onClose, templateToEdit }: Readonly<TemplateFormModalProps>) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [tipo, setTipo] = useState("PARTICIPATION");
    const [cargaHoraria, setCargaHoraria] = useState("");
    const [layout, setLayout] = useState<CertificateLayoutV2>(DEFAULT_LAYOUT);
    const [selected, setSelected] = useState<ElementKey | null>("titulo");
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate();
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const formKey = isOpen ? (templateToEdit?.id ?? "new") : null;
    const [lastFormKey, setLastFormKey] = useState<string | null>(null);

    if (formKey !== lastFormKey) {
        setLastFormKey(formKey);

        if (formKey !== null) {
            setTitulo(templateToEdit?.title ?? "");
            setDescricao("");
            setTipo(templateToEdit?.type ?? "PARTICIPATION");
            setCargaHoraria("");
            setLayout(
                templateToEdit?.layout
                    ? ({ ...DEFAULT_LAYOUT, ...(templateToEdit.layout as object) } as CertificateLayoutV2)
                    : DEFAULT_LAYOUT
            );
            setSelected("titulo");
        }
    }

    const elemento = selected ? layout.elements[selected] : null;

    function updateElement(key: ElementKey, patch: Partial<CertificateLayoutV2["elements"][ElementKey]>) {
        setLayout((prev) => ({
            ...prev,
            elements: { ...prev.elements, [key]: { ...prev.elements[key], ...patch } },
        }));
    }

    async function handleBackground(file: File | undefined) {
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadBackground(file);
            setLayout((prev) => ({ ...prev, backgroundUrl: url }));
            toast.success("Imagem de fundo aplicada.");
        } catch (error) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Erro ao enviar a imagem";
            toast.error(message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function handleSubmit() {
        if (titulo.trim().length < 3) {
            toast.error("O título precisa de ao menos 3 caracteres.");
            return;
        }
        if (!templateToEdit && descricao.trim().length < 10) {
            toast.error("A descrição precisa de ao menos 10 caracteres.");
            return;
        }

        const payload = {
            titulo: titulo.trim(),
            ...(descricao.trim() ? { descricao: descricao.trim() } : {}),
            tipo,
            ...(cargaHoraria ? { cargaHoraria: Number(cargaHoraria) } : {}),
            layout: layout as unknown as Record<string, string>,
        };

        const onDone = { onSuccess: () => onClose() };

        if (templateToEdit) {
            updateMutation.mutate({ id: templateToEdit.id, payload }, onDone);
        } else {
            createMutation.mutate(payload, onDone);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{templateToEdit ? "Editar template" : "Novo template"}</DialogTitle>
                    <DialogDescription>
                        Arraste os elementos no certificado para posicioná-los. O que você vê aqui é o que sai no PDF.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 py-2">
                    <div className="space-y-4">
                        <div style={{ containerType: "inline-size" }}>
                            <CertificateCanvas
                                layout={layout}
                                selected={selected}
                                onSelect={setSelected}
                                onMove={(key, x, y) => updateElement(key, { x, y })}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ImageIcon className="h-4 w-4" />
                                )}
                                {isUploading ? "Enviando..." : "Imagem de fundo"}
                            </Button>

                            {layout.backgroundUrl ? (
                                <Button
                                    variant="ghost"
                                    className="gap-2 text-red-600"
                                    onClick={() => setLayout((prev) => ({ ...prev, backgroundUrl: null }))}
                                >
                                    <Trash2 className="h-4 w-4" /> Remover fundo
                                </Button>
                            ) : (
                                <span className="text-xs text-gray-500">PNG, JPEG ou WebP até 5MB</span>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => handleBackground(e.target.files?.[0])}
                            />

                            <label className="flex items-center gap-2 text-sm text-gray-700 ml-auto">
                                <Checkbox
                                    checked={layout.showBorder}
                                    onCheckedChange={(v) => setLayout((prev) => ({ ...prev, showBorder: v === true }))}
                                />
                                Moldura
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="tpl-fundo">Cor de fundo</Label>
                                <Input
                                    id="tpl-fundo"
                                    type="color"
                                    className="h-10 p-1"
                                    value={layout.corFundo}
                                    onChange={(e) => setLayout((prev) => ({ ...prev, corFundo: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tpl-borda">Cor da moldura</Label>
                                <Input
                                    id="tpl-borda"
                                    type="color"
                                    className="h-10 p-1"
                                    value={layout.corBorda}
                                    onChange={(e) => setLayout((prev) => ({ ...prev, corBorda: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <section className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Dados</h3>

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
                                <Label htmlFor="tpl-descricao">Descrição {templateToEdit ? "" : "*"}</Label>
                                <textarea
                                    id="tpl-descricao"
                                    rows={2}
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Texto do corpo do certificado"
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
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
                                    <Label htmlFor="tpl-carga">Carga (h)</Label>
                                    <Input
                                        id="tpl-carga"
                                        type="number"
                                        min={1}
                                        value={cargaHoraria}
                                        onChange={(e) => setCargaHoraria(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3 border-t pt-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Elementos</h3>

                            <div className="flex flex-wrap gap-2">
                                {ELEMENT_KEYS.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelected(key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                            selected === key
                                                ? "bg-yellow-400 text-gray-900"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {ELEMENT_LABELS[key]}
                                    </button>
                                ))}
                            </div>

                            {elemento && selected ? (
                                <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={elemento.visible}
                                            onCheckedChange={(v) => updateElement(selected, { visible: v === true })}
                                        />
                                        Mostrar no certificado
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="el-x">X</Label>
                                            <Input
                                                id="el-x"
                                                type="number"
                                                className="h-9"
                                                value={elemento.x}
                                                onChange={(e) =>
                                                    updateElement(selected, { x: Number(e.target.value) || 0 })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="el-y">Y</Label>
                                            <Input
                                                id="el-y"
                                                type="number"
                                                className="h-9"
                                                value={elemento.y}
                                                onChange={(e) =>
                                                    updateElement(selected, { y: Number(e.target.value) || 0 })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="el-size">Tamanho da fonte: {elemento.size}px</Label>
                                        <input
                                            id="el-size"
                                            type="range"
                                            min={8}
                                            max={60}
                                            className="w-full"
                                            value={elemento.size}
                                            onChange={(e) => updateElement(selected, { size: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="el-cor">Cor</Label>
                                            <Input
                                                id="el-cor"
                                                type="color"
                                                className="h-9 p-1"
                                                value={elemento.color}
                                                onChange={(e) => updateElement(selected, { color: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Alinhamento</Label>
                                            <Select
                                                value={elemento.align}
                                                onValueChange={(value) =>
                                                    updateElement(selected, {
                                                        align: value as "left" | "center" | "right",
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALIGNMENTS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </section>

                        <Button
                            variant="ghost"
                            className="w-full text-gray-500"
                            onClick={() => setLayout(DEFAULT_LAYOUT)}
                        >
                            Restaurar layout padrão
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        {isSubmitting ? "Salvando..." : templateToEdit ? "Salvar" : "Criar template"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
