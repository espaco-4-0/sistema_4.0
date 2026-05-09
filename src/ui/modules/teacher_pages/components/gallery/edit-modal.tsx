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
                <header className="bg-yellow-400 p-8 flex items-center justify-between text-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/30 p-3 rounded-2xl">
                            <Pencil size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Editar Imagem</DialogTitle>
                            <p className="text-sm font-bold opacity-70 uppercase tracking-widest mt-0.5">
                                Gestão de Galeria
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </header>

                <div className="p-10 space-y-8">
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                        <img src={item?.url} alt={item?.title} className="w-full h-full object-contain" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                Título da Imagem
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Dê um nome marcante para esta foto..."
                                className="w-full px-8 py-4 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl text-slate-700 transition-all outline-none font-bold"
                            />
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border-2 border-transparent hover:border-slate-100 transition-all">
                            <div>
                                <p className="text-slate-800 font-extrabold">Exibir na Landing Page?</p>
                                <p className="text-xs text-slate-400 font-bold">
                                    A imagem ficará visível se houver menos de 6 ativas.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`w-14 h-8 rounded-full transition-colors relative shadow-inner cursor-pointer ${
                                    isActive ? "bg-yellow-400" : "bg-slate-300"
                                }`}
                            >
                                <motion.div
                                    animate={{ x: isActive ? 30 : 6 }}
                                    className="absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="p-8 bg-slate-50 flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-400 font-extrabold hover:text-slate-800 transition-colors uppercase tracking-widest text-xs cursor-pointer"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-3 px-10 py-4 bg-yellow-400 text-slate-900 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                        Salvar Alterações
                    </button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
