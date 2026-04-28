import { useEffect, useState } from "react";
import { Local, deleteLocal, getLocais } from "@/src/lib/locais-api";
import { Edit2, Trash2, Users } from "lucide-react";

import { LocalFormModal } from "../locais";

export async function fetchLocaisOnce(): Promise<Local[]> {
    try {
        const list = await getLocais(false);
        return list;
    } catch {
        return [];
    }
}

export function LocalQuickList({
    refreshSignal,
    onUpdated,
    showHeader = true,
}: {
    refreshSignal?: number;
    onUpdated?: () => void;
    showHeader?: boolean;
}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadLocais() {
        setLoading(true);
        setError(null);
        try {
            const list = await getLocais(false);
            setLocais(list);
        } catch (err) {
            setError("Erro ao carregar locais");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLocais();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshSignal]);

    async function handleDelete(local: Local) {
        if (!confirm(`Remover local "${local.nome}"? Esta operação é irreversível.`)) return;
        try {
            await deleteLocal(local.id);
            await loadLocais();
            onUpdated?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erro ao remover local");
        }
    }

    if (loading) {
        return <div className="mt-3 text-sm text-gray-500 animate-pulse">Carregando locais...</div>;
    }

    if (error) {
        return <div className="mt-3 text-sm text-red-600">{error}</div>;
    }

    if (locais.length === 0) {
        return <div className="mt-3 text-sm text-gray-500">Nenhum local cadastrado.</div>;
    }

    return (
        <div className="mt-3 border-gray-100 rounded-lg">
            {showHeader && (
                <div className="flex items-center justify-between mb-3 px-1">
                    <strong className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Locais cadastrados
                    </strong>
                </div>
            )}

            <ul className="space-y-2.5">
                {locais.map((l) => (
                    <li
                        key={l.id}
                        className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{l.nome}</div>
                            <div className="flex items-center gap-3 mt-1 text-gray-500">
                                <div className="flex items-center gap-1 text-[11px] font-medium">
                                    <Users size={12} className="text-gray-400" />
                                    {l.capacidade ? `${l.capacidade} alunos` : "---"}
                                </div>
                                {l.duracaoMin && (
                                    <div className="text-[11px] font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        {l.duracaoMin} min
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                            <LocalFormModal
                                local={l}
                                onSuccess={() => {
                                    loadLocais();
                                    onUpdated?.();
                                }}
                                trigger={
                                    <button
                                        type="button"
                                        className="p-2 hover:cursor-pointer rounded-lg border border-gray-100 bg-white text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200 transition-all"
                                        title="Editar local"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                }
                            />

                            <button
                                type="button"
                                onClick={() => handleDelete(l)}
                                className="p-2 hover:cursor-pointer rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                title="Remover local"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
