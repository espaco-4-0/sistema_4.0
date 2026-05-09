"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/src/ui/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useUploadToGallery } from "../../queries/gallery.queries";

interface GalleryUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GalleryUploadModal({ isOpen, onClose }: GalleryUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { mutate: upload, isPending } = useUploadToGallery();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            if (!title) {
                const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
                setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1).replace(/[-_]/g, " "));
            }
        }
    };

    const handleSave = () => {
        if (!selectedFile) return toast.error("Selecione uma imagem.");
        if (!title.trim()) return toast.error("O título é obrigatório.");

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", title);
        formData.append("isActive", String(isActive));
        formData.append("origin", "UPLOAD");

        upload(formData, {
            onSuccess: () => {
                onClose();
                setSelectedFile(null);
                setPreviewUrl(null);
                setTitle("");
            },
        });
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
                            <Upload size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Novo Upload</DialogTitle>
                            <p className="text-sm font-bold opacity-70 uppercase tracking-widest mt-0.5">
                                Galeria de Fotos
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
                    <div
                        className={`relative h-64 rounded-3xl border-4 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 ${
                            previewUrl
                                ? "border-yellow-400 bg-yellow-50/10"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-yellow-400"
                        }`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileChange}
                        />

                        <AnimatePresence mode="wait">
                            {previewUrl ? (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative w-full h-full p-4"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-2xl"
                                    />
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-slate-800 border border-yellow-400">
                                        Clique para trocar
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <div className="bg-white p-6 rounded-2xl shadow-sm text-slate-300 mx-auto w-fit mb-4">
                                        <ImageIcon size={48} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-lg font-extrabold text-slate-800">Arraste ou clique aqui</p>
                                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">
                                        PNG, JPG ou WEBP até 5MB
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">
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

                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border-2 border-transparent hover:border-slate-100 transition-all">
                            <div className="ml-4">
                                <p className="text-slate-800 font-extrabold">Exibir na Landing Page?</p>
                                <p className="text-xs text-slate-400 font-bold">
                                    A imagem ficará visível imediatamente.
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
                        Finalizar Upload
                    </button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
