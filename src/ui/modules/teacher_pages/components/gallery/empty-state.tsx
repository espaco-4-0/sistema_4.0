"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, RotateCcw } from "lucide-react";

interface GalleryEmptyStateProps {
    onReset: () => void;
}

export function GalleryEmptyState({ onReset }: GalleryEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100"
        >
            <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ImageIcon size={48} className="text-gray-300" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">
                Nenhuma imagem encontrada
            </h3>
            <p className="text-gray-500 mt-2 max-w-xs text-center text-sm">
                Tente ajustar sua busca ou limpar os filtros para ver outros itens.
            </p>

            <button
                onClick={onReset}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md group cursor-pointer text-sm"
            >
                <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
                Resetar Filtros
            </button>
        </motion.div>
    );
}
