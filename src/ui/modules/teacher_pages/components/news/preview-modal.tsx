"use client";

import { Newspaper, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";

interface PreviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    post: BlogPost | null;
}

export function PreviewModal({ isOpen, onOpenChange, post }: PreviewModalProps) {
    if (!post) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none max-h-[90vh] overflow-y-auto shadow-2xl">
                <DialogTitle className="sr-only">Visualização de Postagem</DialogTitle>
                <div className="relative h-[400px] w-full">
                    <img
                        src={post.foto?.url}
                        alt={post.titulo}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                                {post.categoria?.nome || "Inovação"}
                            </span>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                                {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight max-w-3xl drop-shadow-md">
                            {post.titulo}
                        </h2>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-2xl flex items-center justify-center transition-all cursor-pointer z-10"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex items-center gap-4 pb-8 border-b border-gray-100">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl uppercase shadow-inner">
                            {post.autor?.nomeCompleto?.charAt(0) || "A"}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Autor da Publicação</p>
                            <p className="text-lg font-bold text-gray-900">{post.autor?.nomeCompleto || "Administrador"}</p>
                        </div>
                    </div>

                    <div className="prose prose-yellow max-w-none">
                        <p className="text-xl text-gray-500 font-medium leading-relaxed italic mb-8 border-l-4 border-yellow-400 pl-6 bg-yellow-50/30 py-4 rounded-r-2xl">
                            {post.resumo}
                        </p>
                        <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {post.conteudo}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
