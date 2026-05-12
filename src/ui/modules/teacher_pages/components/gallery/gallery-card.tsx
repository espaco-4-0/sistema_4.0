"use client";

import { GalleryItem } from "@/src/generated/prisma/browser";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Cloud, Edit2, MapPin, Trash2 } from "lucide-react";

import { useToggleGalleryStatus } from "../../queries/gallery.queries";

interface GalleryCardProps {
    item: GalleryItem;
    onDelete: () => void;
    onEdit: () => void;
}

export function GalleryCard({ item, onDelete, onEdit }: GalleryCardProps) {
    const { mutate: toggleStatus, isPending: isToggling } = useToggleGalleryStatus();

    const handleToggleActive = () => {
        toggleStatus({
            id: item.id,
            isActive: !item.isActive,
            title: item.title,
        });
    };

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-yellow-400 transition-all duration-300 h-full">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 backdrop-blur-[1px] transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={onEdit}
                        className="p-3 bg-white text-slate-800 rounded-lg hover:bg-yellow-400 hover:scale-110 transition-all shadow-md cursor-pointer"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-3 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-md cursor-pointer"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="absolute top-3 left-3">
                    {item.origin === "UPLOAD" ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400 text-gray-900 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            <Cloud size={12} /> Upload
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            <MapPin size={12} className="text-blue-500" /> Post
                        </div>
                    )}
                </div>

                <button
                    onClick={handleToggleActive}
                    disabled={isToggling}
                    className={`absolute top-3 right-3 w-10 h-5 rounded-full transition-colors relative shadow-inner cursor-pointer ${
                        item.isActive ? "bg-yellow-400" : "bg-gray-300"
                    }`}
                >
                    <motion.div
                        animate={{ x: item.isActive ? 20 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                </button>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight" title={item.title}>
                        {item.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${item.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                        />
                        <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${item.isActive ? "text-green-600" : "text-gray-400"}`}
                        >
                            {item.isActive ? "Visível" : "Oculto"}
                        </span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                        {format(new Date(item.createdAt), "dd MMM", { locale: ptBR })}
                    </p>
                </div>
            </div>
        </div>
    );
}
