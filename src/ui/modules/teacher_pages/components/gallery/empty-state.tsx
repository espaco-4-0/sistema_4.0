"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, RotateCcw } from "lucide-react";

interface GalleryEmptyStateProps {
    onReset: () => void;
}

export function GalleryEmptyState({ onReset }: GalleryEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
        >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#facc15]/10 blur-[60px] rounded-full scale-150" />
                <div className="relative bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 text-slate-200">
                    <ImageIcon size={100} strokeWidth={1} />
                </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                Espaço Vazio
            </h2>
            <p className="text-slate-400 font-bold mb-10 max-w-sm mx-auto leading-relaxed">
                Nenhuma imagem foi encontrada para os filtros aplicados. Tente ajustar sua busca ou limpar os filtros.
            </p>

            <button
                onClick={onReset}
                className="flex items-center gap-3 px-10 py-4 bg-slate-800 text-white rounded-[2rem] font-black hover:bg-slate-900 transition-all shadow-xl shadow-slate-800/20 group cursor-pointer"
            >
                <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                Resetar Filtros
            </button>
        </motion.div>
    );
}
