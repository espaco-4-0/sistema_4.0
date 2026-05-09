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
                className="max-w-md w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl"
            >
                <DialogTitle className="sr-only">Confirmação de Exclusão</DialogTitle>
                <div className="p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <Trash2 size={32} strokeWidth={2} />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Excluir Imagem</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            Você tem certeza que deseja excluir esta imagem? Esta ação é{" "}
                            <span className="text-red-500 font-bold">irreversível</span>.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors cursor-pointer text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-sm shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Sim, Excluir
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>
            </DialogContent>
        </Dialog>
    );
}
