"use client";

import { AlertCircle, FileText, Newspaper, Pencil, RotateCcw, Search, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { BlogPost } from "@/src/infra/modules/blog/blog.types";
import { Skeleton } from "@/src/ui/components/ui/skeleton";

interface PostListProps {
    posts: BlogPost[];
    isLoading: boolean;
    activeTab: string;
    onPreview: (post: BlogPost) => void;
    onEdit: (post: BlogPost) => void;
    onConfirm: (type: "delete" | "approve" | "reject" | "unpublish", post: BlogPost) => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function PostList({ posts, isLoading, activeTab, onPreview, onEdit, onConfirm }: PostListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex justify-between gap-2 pt-2">
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100"
            >
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Newspaper size={48} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Nenhuma notícia encontrada</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-center">Tente ajustar sua busca ou mude a aba para ver outros posts.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                    <motion.div
                        key={post.id}
                        variants={itemVariants}
                        layout
                        className="group bg-white rounded-[2.5rem] p-5 border border-gray-100 hover:border-yellow-200 transition-all shadow-sm hover:shadow-xl hover:shadow-yellow-400/5 flex flex-col h-full relative overflow-hidden"
                    >
                        <div className="relative h-48 mb-5 overflow-hidden rounded-[1.8rem] shadow-inner">
                            <img
                                src={post.foto?.url}
                                alt={post.titulo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-gray-800 rounded-xl shadow-sm border border-white/50">
                                    {post.categoria?.nome || "Geral"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 px-1">
                            <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-yellow-600 transition-colors">
                                {post.titulo}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 italic font-medium">
                                {post.resumo}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3 pt-5 border-t border-gray-50">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 text-[10px] font-bold border-2 border-white shadow-sm uppercase">
                                    {post.autor?.nomeCompleto?.charAt(0) || "A"}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onPreview(post)}
                                    className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                                    title="Visualizar"
                                >
                                    <Search size={18} />
                                </button>
                                <button
                                    onClick={() => onEdit(post)}
                                    className="p-2.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all cursor-pointer"
                                    title="Editar"
                                >
                                    <Pencil size={18} />
                                </button>
                                {activeTab === "ativos" ? (
                                    <>
                                        <button
                                            onClick={() => onConfirm("unpublish", post)}
                                            className="p-2.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all cursor-pointer"
                                            title="Suspender"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button
                                            onClick={() => onConfirm("delete", post)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onConfirm("approve", post)}
                                            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all cursor-pointer"
                                            title="Aprovar"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => onConfirm("reject", post)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Recusar"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
