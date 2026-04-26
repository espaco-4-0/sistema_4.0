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
import { Clock, Home, Plus, Users } from "lucide-react";

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

            <DialogContent className="max-w-lg border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Home className="w-4 h-4 text-black" />
                        </div>
                        <div>
                            <DialogTitle className="text-[15px] font-semibold text-gray-900 leading-tight">
                                {isEdit ? "Editar local" : "Cadastrar novo local"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-400 mt-0.5">
                                {isEdit
                                    ? "Altere os dados do local selecionado."
                                    : "Preencha os dados do local e salve."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Nome do local <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                            placeholder="Ex: Laboratório de Robótica"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Descrição
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={2}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                            placeholder="Descreva brevemente o uso deste local..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                Duração
                            </label>
                            <div className="relative">
                                <input
                                    value={duracao}
                                    onChange={(e) => setDuracao(e.target.value === "" ? "" : Number(e.target.value))}
                                    type="number"
                                    min={0}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                    placeholder="45"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">
                                    min
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-3 h-3" />
                                Capacidade
                            </label>
                            <div className="relative">
                                <input
                                    value={capacidade}
                                    onChange={(e) => setCapacidade(e.target.value === "" ? "" : Number(e.target.value))}
                                    type="number"
                                    min={0}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                    placeholder="30"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">
                                    pessoas
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setAtivo((v) => !v)}
                        className="w-full flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-700">Disponível para novas visitas</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {ativo ? "Ativo — aceita agendamentos" : "Inativo — sem novos agendamentos"}
                            </p>
                        </div>

                        <div
                            className={`relative shrink-0 w-10 h-5.5 rounded-full transition-colors duration-200 ${
                                ativo ? "bg-amber-400" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-0.75 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                                    ativo ? "left-5.5" : "left-0.75"
                                }`}
                            />
                        </div>
                    </button>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors hover:cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-amber-400 hover:bg-yellow-500 text-stone-900 font-semibold text-sm transition-colors hover:cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar local"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
