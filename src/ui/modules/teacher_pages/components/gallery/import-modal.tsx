"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/ui/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Image as ImageIcon, Loader2, Newspaper, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { useUploadToGallery } from "../../queries/gallery.queries";
import { useNewsList } from "../../queries/news.queries";

interface GalleryImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GalleryImportModal({ isOpen, onClose }: GalleryImportModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: newsData, isLoading } = useNewsList({
        limit: 20,
        published: true,
        name: searchTerm,
    });

    const { mutate: upload, isPending: isUploading } = useUploadToGallery();

    const handleImport = (post: any) => {
        if (!post.foto?.url) return toast.error("Este post não possui uma imagem de capa.");

        const truncatedTitle = post.titulo.length > 100 ? post.titulo.substring(0, 97) + "..." : post.titulo;

        const formData = new FormData();
        formData.append("title", truncatedTitle);
        formData.append("isActive", "true");
        formData.append("origin", "POST");
        formData.append("postId", post.id);

        upload(formData, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-3xl w-[95%] p-0 bg-white rounded-3xl overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]"
            >
                <header className="bg-yellow-400 p-8 flex items-center justify-between text-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/30 p-3 rounded-2xl">
                            <Newspaper size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Importar de Post</DialogTitle>
                            <p className="text-sm font-bold opacity-70 uppercase tracking-widest mt-0.5">
                                Selecione uma postagem
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

                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 shrink-0">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar posts por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 focus:border-yellow-400 rounded-xl text-sm transition-all outline-none font-semibold shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="animate-spin text-yellow-500" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                Buscando postagens...
                            </p>
                        </div>
                    ) : newsData?.data?.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="bg-gray-50 p-6 rounded-2xl w-fit mx-auto text-gray-300">
                                <ImageIcon size={48} />
                            </div>
                            <p className="text-gray-500 font-bold">Nenhum post encontrado</p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                                Limpar Busca
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {newsData?.data?.map((post: any) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-2xl hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => handleImport(post)}
                                >
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                        {post.foto?.url ? (
                                            <img
                                                src={post.foto.url}
                                                alt={post.titulo}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-base truncate group-hover:text-gray-900 transition-colors">
                                            {post.titulo}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-50 px-2 py-0.5 rounded">
                                                {post.categoria?.nome || "Geral"}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                {format(new Date(post.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mr-2">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-yellow-400 group-hover:text-gray-900 flex items-center justify-center text-gray-300 transition-all">
                                            {isUploading ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <Plus size={20} strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center shrink-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                        Total de {newsData?.meta?.total || 0} postagens disponíveis
                    </p>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
