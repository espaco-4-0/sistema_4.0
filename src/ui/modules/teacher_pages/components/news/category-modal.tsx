"use client";

import { useState } from "react";
import { Loader2, Plus, Tag, Trash2, Edit2, X, Check, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import { toast } from "sonner";
import { 
    useCategories, 
    useCreateCategory, 
    useUpdateCategory, 
    useDeleteCategory 
} from "../../queries/news.queries";

interface CategoryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryModal({ isOpen, onOpenChange }: CategoryModalProps) {
    const { data: categories = [], isLoading } = useCategories(true);
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const handleCreate = () => {
        if (!newCategory.trim()) return;
        createMutation.mutate(newCategory, {
            onSuccess: () => setNewCategory(""),
        });
    };

    const handleUpdate = (id: string) => {
        if (!editingName.trim()) return;
        updateMutation.mutate({ id, name: editingName }, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta categoria?")) {
            deleteMutation.mutate(id);
        }
    };

    const startEditing = (id: string, name: string) => {
        setEditingId(id);
        setEditingName(name);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl">
                <div className="bg-yellow-400 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-900">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Tag size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Gerenciar Categorias</DialogTitle>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wider mt-0.5">Categorias do Blog</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="text-center text-gray-500 py-8 italic">Nenhuma categoria cadastrada.</p>
                        ) : (
                            categories.map((cat: any) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                    {editingId === cat.id ? (
                                        <div className="flex items-center gap-2 flex-1 mr-2">
                                            <input
                                                type="text"
                                                className="flex-1 bg-white border-2 border-yellow-400 rounded-xl px-3 py-1 text-sm outline-none"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdate(cat.id);
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleUpdate(cat.id)}
                                                className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">{cat.nome}</span>
                                                <span className={`text-[10px] font-bold uppercase ${(cat._count?.posts || 0) > 0 ? "text-yellow-600" : "text-gray-400"}`}>
                                                    {cat._count?.posts || 0} posts vinculados
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => startEditing(cat.id, cat.nome)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Editar nome"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {(cat._count?.posts || 0) > 0 ? (
                                                    <div 
                                                        className="p-2 text-gray-300 cursor-not-allowed"
                                                        title="Esta categoria possui posts e não pode ser excluída"
                                                    >
                                                        <Lock size={16} />
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Excluir categoria"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 block mb-2">Nova Categoria</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ex: Tecnologia, Eventos..."
                                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-sm font-medium"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            />
                            <button
                                onClick={handleCreate}
                                disabled={!newCategory.trim() || createMutation.isPending}
                                className="px-4 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                <span className="hidden sm:inline">Adicionar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors text-sm cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
