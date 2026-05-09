"use client";

import { Dialog, DialogContent, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Loader2, Trash2, X } from "lucide-react";

import { useDeleteGalleryItem } from "../../queries/gallery.queries";

interface GalleryDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
}

export function GalleryDeleteModal({ isOpen, onClose, itemId }: GalleryDeleteModalProps) {
    const { mutate: deleteItem, isPending } = useDeleteGalleryItem();

    const handleDelete = () => {
        if (!itemId) return;
        deleteItem(itemId, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-md w-[90%] p-0 bg-white rounded-[3rem] overflow-hidden border-none shadow-2xl"
            >
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-8 shadow-inner shadow-red-100">
                        <Trash2 size={48} strokeWidth={1.5} />
                    </div>

                    <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight mb-4">
                        Tem certeza?
                    </DialogTitle>
                    <p className="text-slate-500 font-bold leading-relaxed mb-10">
                        Você está prestes a excluir esta imagem da galeria. Esta ação é{" "}
                        <span className="text-red-500 underline decoration-2 underline-offset-4">irreversível</span> e
                        removerá o item permanentemente.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-slate-100 text-slate-500 rounded-[1.8rem] font-extrabold hover:bg-slate-200 hover:text-slate-700 transition-all uppercase tracking-widest text-xs cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-[1.8rem] font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs cursor-pointer"
                        >
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : "Sim, Excluir"}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                >
                    <X size={20} />
                </button>
            </DialogContent>
        </Dialog>
    );
}
