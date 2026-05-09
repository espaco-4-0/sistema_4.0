"use client";

import { useEffect, useState } from "react";
import { GalleryItem } from "@/src/generated/prisma/browser";
import { Dialog, DialogContent, DialogTitle } from "@/src/ui/components/ui/dialog";
import { motion } from "framer-motion";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { useToggleGalleryStatus } from "../../queries/gallery.queries";

interface GalleryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: GalleryItem | null;
}

export function GalleryEditModal({ isOpen, onClose, item }: GalleryEditModalProps) {
    const [title, setTitle] = useState("");
    const [isActive, setIsActive] = useState(true);

    const { mutate: update, isPending } = useToggleGalleryStatus();

    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setIsActive(item.isActive);
        }
    }, [item, isOpen]);

    const handleSave = () => {
        if (!item) return;
        if (!title.trim()) return toast.error("O título é obrigatório.");

        update(
            {
                id: item.id,
                title,
                isActive,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-2xl w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl"
            >
                <header className="bg-yellow-400 p-6 flex items-center justify-between text-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/30 p-2 rounded-xl">
                            <Pencil size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">Editar Imagem</DialogTitle>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wider mt-0.5">
                                Gestão de Galeria
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                        <img src={item?.url} alt={item?.title} className="w-full h-full object-contain p-2" />
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                Título da Imagem
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Dê um nome marcante para esta foto..."
                                className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-xl text-slate-700 transition-all outline-none font-medium text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-slate-800 font-bold text-sm">Exibir na Landing Page?</p>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    A imagem ficará visível se houver menos de 6 ativas.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-12 h-6 rounded-full transition-colors relative shadow-inner cursor-pointer ${
                                    isActive ? "bg-yellow-400" : "bg-slate-300"
                                }`}
                            >
                                <motion.div
                                    animate={{ x: isActive ? 26 : 4 }}
                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors text-sm cursor-pointer"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Salvar Alterações
                    </button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
