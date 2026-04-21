import { useEffect, useState } from "react";
import { Local, createLocal, updateLocal } from "@/src/lib/locais-api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/ui/components/ui/dialog";
import { Edit2, Plus } from "lucide-react";

type Props = {
    local?: Local;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
};

export function LocalFormModal({ local, onSuccess, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [capacidade, setCapacidade] = useState<number | "">("");
    const [duracao, setDuracao] = useState<number | "">("");
    const [ativo, setAtivo] = useState(true);
    const [loading, setLoading] = useState(false);

    const isEdit = !!local;

    useEffect(() => {
        if (open && local) {
            setNome(local.nome || "");
            setDescricao(local.descricao || "");
            setCapacidade(local.capacidade ?? "");
            setDuracao(local.duracaoMin ?? "");
            setAtivo(local.ativo ?? true);
        } else if (open && !local) {
            // Reset para criação
            setNome("");
            setDescricao("");
            setCapacidade("");
            setDuracao("");
            setAtivo(true);
        }
    }, [open, local]);

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!nome.trim()) {
            alert("O nome é obrigatório");
            return;
        }
        setLoading(true);
        try {
            const data = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                capacidade: capacidade === "" ? null : Number(capacidade),
                duracaoMin: duracao === "" ? null : Number(duracao),
                ativo,
            };

            if (isEdit && local) {
                await updateLocal(local.id, data);
            } else {
                await createLocal(data);
            }

            setOpen(false);
            onSuccess?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erro ao salvar local");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 p-2 transition-all hover:cursor-pointer rounded-full bg-yellow-500 text-black font-semibold hover:bg-yellow-600 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-lg border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar local" : "Cadastrar novo local"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Altere os dados do local selecionado." : "Preencha os dados do local e salve."}
                    </DialogDescription>
                </DialogHeader>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            Nome do local *
                        </label>
                        <input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                            placeholder="Ex: Laboratório de Robótica"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            Descrição
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={2}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none"
                            placeholder="Descreva brevemente o uso deste local..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Duração (minutos)
                            </label>
                            <div className="relative">
                                <input
                                    value={duracao}
                                    onChange={(e) => setDuracao(e.target.value === "" ? "" : Number(e.target.value))}
                                    type="number"
                                    min={0}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                    placeholder="Ex: 45"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Capacidade
                            </label>
                            <input
                                value={capacidade}
                                onChange={(e) => setCapacidade(e.target.value === "" ? "" : Number(e.target.value))}
                                type="number"
                                min={0}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                placeholder="Ex: 30"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <input
                            id="ativo-checkbox"
                            type="checkbox"
                            checked={ativo}
                            onChange={(e) => setAtivo(e.target.checked)}
                            className="size-4 accent-yellow-500 rounded border-gray-300"
                        />
                        <label
                            htmlFor="ativo-checkbox"
                            className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
                        >
                            Local disponível para novas visitas
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-xl bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-600 transition-all shadow-md shadow-yellow-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar Local"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
