"use client";

import { useState } from "react";
import {
    AdminCourseItem,
    COURSE_RESOURCE_LABELS,
    CoursePayload,
    WEEKDAY_LABELS,
} from "@/src/infra/modules/professor/courses-admin.service";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    useCreateCourse,
    useLocationOptions,
    useProfessorOptions,
    useUpdateCourse,
} from "@/src/ui/modules/teacher_pages/queries/courses.queries";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const ALL_RESOURCES = Object.keys(COURSE_RESOURCE_LABELS);

type SlotDraft = {
    key: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    locationId: string;
};

interface CourseFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    courseToEdit?: AdminCourseItem | null;
}

function toMinutes(time: string): number {
    const [h, m] = time.split(":");
    return Number(h) * 60 + Number(m);
}

function emptySlot(): SlotDraft {
    return { key: crypto.randomUUID(), dayOfWeek: 1, startTime: "14:00", endTime: "16:00", locationId: "" };
}

export function CourseFormModal({ isOpen, onOpenChange, onClose, courseToEdit }: Readonly<CourseFormModalProps>) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [cargaHoraria, setCargaHoraria] = useState("");
    const [vagas, setVagas] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [professorId, setProfessorId] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [slots, setSlots] = useState<SlotDraft[]>([]);
    const [acessos, setAcessos] = useState<string[]>([]);

    const { data: locations = [] } = useLocationOptions();
    const { data: professores = [] } = useProfessorOptions();
    const createMutation = useCreateCourse();
    const updateMutation = useUpdateCourse();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // Sincroniza o formulário com o curso em edição no render, não em efeito:
    // um useEffect aqui dispararia uma segunda renderização a cada abertura.
    const formKey = isOpen ? (courseToEdit?.id ?? "new") : null;
    const [lastFormKey, setLastFormKey] = useState<string | null>(null);

    if (formKey !== lastFormKey) {
        setLastFormKey(formKey);

        if (formKey !== null) {
            setTitulo(courseToEdit?.title ?? "");
            setDescricao(courseToEdit?.description ?? "");
            setCargaHoraria(courseToEdit?.workload ? String(courseToEdit.workload) : "");
            setVagas(courseToEdit?.capacity ? String(courseToEdit.capacity) : "");
            setDataInicio(courseToEdit?.startDate ? courseToEdit.startDate.slice(0, 10) : "");
            setDataFim(courseToEdit?.endDate ? courseToEdit.endDate.slice(0, 10) : "");
            setProfessorId(courseToEdit?.professorId ?? "");
            setAtivo(courseToEdit?.isActive ?? true);
            setSlots(
                (courseToEdit?.CourseSchedule ?? []).map((slot) => ({
                    key: slot.id ?? crypto.randomUUID(),
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    locationId: slot.locationId ?? "",
                }))
            );
            setAcessos((courseToEdit?.CourseAccess ?? []).filter((a) => a.enabled).map((a) => a.resource));
        }
    }

    function updateSlot(key: string, patch: Partial<SlotDraft>) {
        setSlots((prev) => prev.map((slot) => (slot.key === key ? { ...slot, ...patch } : slot)));
    }

    /** Espelha as regras do Zod no servidor para dar feedback antes do request. */
    function validate(): string | null {
        if (titulo.trim().length < 3) return "O título precisa de ao menos 3 caracteres.";
        if (descricao.trim() && descricao.trim().length < 10) return "A descrição precisa de ao menos 10 caracteres.";
        if (cargaHoraria && Number(cargaHoraria) <= 0) return "Carga horária deve ser positiva.";
        if (vagas && Number(vagas) <= 0) return "O número de vagas deve ser maior que zero.";
        if (dataInicio && dataFim && dataFim < dataInicio) return "A data de término deve ser posterior à de início.";

        for (const slot of slots) {
            if (toMinutes(slot.endTime) <= toMinutes(slot.startTime)) {
                return `${WEEKDAY_LABELS[slot.dayOfWeek]}: o horário de término deve ser posterior ao de início.`;
            }
        }

        const byDay = new Map<number, SlotDraft[]>();
        slots.forEach((slot) => byDay.set(slot.dayOfWeek, [...(byDay.get(slot.dayOfWeek) ?? []), slot]));

        for (const [day, daySlots] of byDay) {
            const ordered = [...daySlots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
            for (let i = 1; i < ordered.length; i++) {
                if (toMinutes(ordered[i].startTime) < toMinutes(ordered[i - 1].endTime)) {
                    return `${WEEKDAY_LABELS[day]}: há horários sobrepostos.`;
                }
            }
        }

        return null;
    }

    function handleSubmit() {
        const problem = validate();
        if (problem) {
            toast.error(problem);
            return;
        }

        const payload: CoursePayload = {
            titulo: titulo.trim(),
            ...(descricao.trim() ? { descricao: descricao.trim() } : {}),
            ...(cargaHoraria ? { cargaHoraria: Number(cargaHoraria) } : {}),
            vagas: vagas ? Number(vagas) : null,
            dataInicio: dataInicio || null,
            dataFim: dataFim || null,
            ativo,
            ...(professorId ? { professorId } : {}),
            agenda: slots.map((slot) => ({
                diaSemana: slot.dayOfWeek,
                horaInicio: slot.startTime,
                horaFim: slot.endTime,
                localId: slot.locationId || null,
            })),
            acessos: ALL_RESOURCES.map((resource) => ({ recurso: resource, liberado: acessos.includes(resource) })),
        };

        const onDone = { onSuccess: () => onClose() };

        if (courseToEdit) {
            updateMutation.mutate({ id: courseToEdit.id, payload }, onDone);
        } else {
            createMutation.mutate(payload, onDone);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
                <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        {courseToEdit ? "Editar Curso" : "Novo Curso"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Defina os dados, a agenda semanal e o que os alunos matriculados poderão acessar.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-6 space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Dados do curso</h3>

                        <div className="space-y-1">
                            <label htmlFor="curso-titulo" className="text-sm font-medium text-gray-700">
                                Nome do curso *
                            </label>
                            <Input
                                id="curso-titulo"
                                className="h-11"
                                placeholder="Ex: Robótica Educacional"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="curso-descricao" className="text-sm font-medium text-gray-700">
                                Descrição
                            </label>
                            <textarea
                                id="curso-descricao"
                                rows={3}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                placeholder="Mínimo de 10 caracteres"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="curso-carga" className="text-sm font-medium text-gray-700">
                                    Carga horária (h)
                                </label>
                                <Input
                                    id="curso-carga"
                                    type="number"
                                    min={1}
                                    className="h-11"
                                    value={cargaHoraria}
                                    onChange={(e) => setCargaHoraria(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="curso-vagas" className="text-sm font-medium text-gray-700">
                                    Vagas
                                </label>
                                <Input
                                    id="curso-vagas"
                                    type="number"
                                    min={1}
                                    className="h-11"
                                    placeholder="Sem limite"
                                    value={vagas}
                                    onChange={(e) => setVagas(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="curso-inicio" className="text-sm font-medium text-gray-700">
                                    Data de início
                                </label>
                                <Input
                                    id="curso-inicio"
                                    type="date"
                                    className="h-11"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="curso-fim" className="text-sm font-medium text-gray-700">
                                    Data de término
                                </label>
                                <Input
                                    id="curso-fim"
                                    type="date"
                                    className="h-11"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Professor responsável</p>
                                <Select value={professorId} onValueChange={setProfessorId}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Selecione o responsável" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {professores.map((prof) => (
                                            <SelectItem key={prof.id} value={prof.id}>
                                                {prof.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <Checkbox checked={ativo} onCheckedChange={(v) => setAtivo(v === true)} />
                                    Curso ativo (aceita inscrições)
                                </label>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Agenda</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Dias e horários recorrentes. É possível ter mais de um horário no mesmo dia.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setSlots((prev) => [...prev, emptySlot()])}
                            >
                                <Plus className="h-4 w-4" /> Adicionar horário
                            </Button>
                        </div>

                        {slots.length === 0 ? (
                            <p className="text-sm text-gray-400 italic py-4 text-center border border-dashed rounded-lg">
                                Nenhum horário definido.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.key}
                                        className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2"
                                    >
                                        <div className="col-span-3">
                                            <Select
                                                value={String(slot.dayOfWeek)}
                                                onValueChange={(v) => updateSlot(slot.key, { dayOfWeek: Number(v) })}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {WEEKDAY_LABELS.map((label, index) => (
                                                        <SelectItem key={label} value={String(index)}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="time"
                                                className="h-10"
                                                value={slot.startTime}
                                                onChange={(e) => updateSlot(slot.key, { startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="time"
                                                className="h-10"
                                                value={slot.endTime}
                                                onChange={(e) => updateSlot(slot.key, { endTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <Select
                                                value={slot.locationId || "none"}
                                                onValueChange={(v) =>
                                                    updateSlot(slot.key, { locationId: v === "none" ? "" : v })
                                                }
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Local (opcional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Sem local definido</SelectItem>
                                                    {locations.map((local) => (
                                                        <SelectItem key={local.id} value={local.id}>
                                                            {local.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                aria-label="Remover horário"
                                                onClick={() =>
                                                    setSlots((prev) => prev.filter((s) => s.key !== slot.key))
                                                }
                                                className="p-2 text-gray-400 hover:text-red-600 transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-3 border-t pt-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                Controle de acesso
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                O que os alunos matriculados neste curso poderão acessar no sistema.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {ALL_RESOURCES.map((resource) => (
                                <label
                                    key={resource}
                                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={acessos.includes(resource)}
                                        onCheckedChange={(checked) =>
                                            setAcessos((prev) =>
                                                checked === true
                                                    ? [...prev, resource]
                                                    : prev.filter((r) => r !== resource)
                                            )
                                        }
                                    />
                                    {COURSE_RESOURCE_LABELS[resource]}
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <DialogFooter className="px-8 py-5 bg-gray-50 border-t flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="h-11 px-6">
                        <X className="h-4 w-4" /> Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-11 px-8 gap-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Salvando..." : courseToEdit ? "Salvar alterações" : "Criar curso"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
