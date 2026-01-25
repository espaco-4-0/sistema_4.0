import { ChangeEvent, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";

interface ImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ImportCSVModal({ isOpen, onClose }: ImportCSVModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const handlePickFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        console.log("Enviando arquivo:", file.name);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Importar Usuários em Massa</DialogTitle>
                    <DialogDescription>
                        Faça upload de um arquivo CSV para cadastrar múltiplos usuários.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="font-medium text-blue-900 text-sm">Baixe o Template</p>
                        <button
                            type="button"
                            className="mt-2 text-blue-600 border border-blue-600 px-3 py-1 rounded-md text-xs hover:bg-blue-100 transition"
                        >
                            Baixar Template CSV
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 p-8 rounded-lg text-center hover:bg-gray-50/50 transition">
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <p className="text-green-600 font-medium text-sm mb-1">Arquivo selecionado:</p>
                                <p className="text-gray-800 font-bold text-base truncate max-w-50">{file.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-red-500 text-xs mt-2 underline hover:text-red-700"
                                >
                                    Remover
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    onClick={handlePickFile}
                                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-500 transition shadow-sm"
                                >
                                    Selecionar Arquivo CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file}
                        className={`px-4 py-2 rounded-md text-sm font-bold text-white transition
                            ${file ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}
                        `}
                    >
                        Importar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
