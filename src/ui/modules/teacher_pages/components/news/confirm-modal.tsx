"use client";

import { Check, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { useApprovePost, useDeletePost, useRejectPost, useUnpublishPost } from "../../queries/news.queries";

interface ConfirmModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    action: {
        type: "delete" | "approve" | "reject" | "unpublish";
        post: BlogPost;
    } | null;
}

export function ConfirmModal({ isOpen, onOpenChange, action }: ConfirmModalProps) {
    const approveMutation = useApprovePost();
    const unpublishMutation = useUnpublishPost();
    const deleteMutation = useDeletePost();
    const rejectMutation = useRejectPost();

    if (!action) return null;

    const getConfig = () => {
        switch (action.type) {
            case "delete":
                return {
                    title: "Excluir Publicação",
                    description: "Você tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.",
                    color: "bg-red-500 hover:bg-red-600",
                    icon: <Trash2 size={32} className="text-red-600" />,
                    bg: "bg-red-50"
                };
            case "approve":
                return {
                    title: "Publicar Notícia",
                    description: "Você tem certeza que deseja publicar esta notícia? Ela ficará visível para todos os usuários.",
                    color: "bg-green-500 hover:bg-green-600",
                    icon: <Check size={32} className="text-green-600" />,
                    bg: "bg-green-50"
                };
            case "reject":
                return {
                    title: "Recusar Solicitação",
                    description: "Você tem certeza que deseja recusar esta solicitação? O autor poderá enviar novamente no futuro.",
                    color: "bg-red-500 hover:bg-red-600",
                    icon: <X size={32} className="text-red-600" />,
                    bg: "bg-red-50"
                };
            case "unpublish":
                return {
                    title: "Transformar em Solicitação",
                    description: "Este post deixará de estar ativo e voltará para a lista de solicitações pendentes.",
                    color: "bg-yellow-500 hover:bg-yellow-600",
                    icon: <RotateCcw size={32} className="text-yellow-600" />,
                    bg: "bg-yellow-50"
                };
        }
    };

    const config = getConfig();
    const isPending = approveMutation.isPending || unpublishMutation.isPending || deleteMutation.isPending || rejectMutation.isPending;

    const handleConfirm = () => {
        const { type, post } = action;
        const callbacks = { onSuccess: () => onOpenChange(false) };
        
        if (type === "approve") approveMutation.mutate(post.slug, callbacks);
        if (type === "unpublish") unpublishMutation.mutate(post.slug, callbacks);
        if (type === "delete") deleteMutation.mutate(post.slug, callbacks);
        if (type === "reject") rejectMutation.mutate(post.slug, callbacks);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl">
                <DialogTitle className="sr-only">Confirmação de Ação</DialogTitle>
                <div className="p-8 text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 ${config.bg} rounded-full flex items-center justify-center`}>
                        {config.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">{config.description}</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="flex-1 py-3 text-gray-600 font-bold hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className={`flex-1 py-3 ${config.color} text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2`}
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirmar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
