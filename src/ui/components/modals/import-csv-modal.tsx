import { ChangeEvent, useRef, useState, DragEvent } from "react";
import { Download, UploadCloud, FileText, X } from "lucide-react";
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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Função para baixar o arquivo da pasta public/templates
    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/teste.csv';
        link.download = 'teste.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setFile(null);
            onClose();
        }
    };

    const handleFile = (selectedFile: File) => {
        if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
            setFile(selectedFile);
        } else {
            alert("Por favor, selecione apenas arquivos CSV.");
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) handleFile(selectedFile);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl text-gray-800">Importar Usuários em Massa</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Adicione múltiplos usuários de uma vez através de um arquivo estruturado.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    <div className="flex items-start gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Download size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">Baixe o Template</p>
                            <p className="text-xs text-blue-700/80 mb-3">
                                Utilize nosso modelo CSV para garantir que os dados estejam no formato correto.
                            </p>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                                <FileText size={14} /> Baixar Template CSV
                            </button>
                        </div>
                    </div>

                    <button
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
                            flex flex-col items-center justify-center gap-3 w-full
                            ${isDragging ? "border-yellow-400 bg-yellow-50/50" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"}
                            ${file ? "border-green-200 bg-green-50/30" : ""}
                        `}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2">
                                    <FileText size={32} />
                                </div>
                                <p className="text-gray-900 font-semibold text-sm truncate max-w-62.5">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="flex items-center gap-1 text-red-500 text-xs mt-3 font-medium hover:bg-red-50 px-2 py-1 rounded-md transition"
                                >
                                    <X size={14} /> Remover arquivo
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-100 p-3 rounded-full text-gray-400 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">Faça Upload do Arquivo CSV</p>
                                    <p className="text-xs text-gray-400 mt-1">Arraste aqui ou clique para selecionar</p>
                                </div>
                                <button
                                    type="button"
                                    className="mt-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold text-xs hover:bg-yellow-500 transition shadow-md active:scale-95"
                                >
                                    Selecionar Arquivo
                                </button>
                            </>
                        )}
                    </button>
                </div>

                <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 font-semibold text-sm hover:text-gray-800 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (file) console.log("Enviando:", file.name);
                            onClose();
                        }}
                        disabled={!file}
                        className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg
                            ${file
                                ? "bg-gray-900 text-white hover:bg-black hover:shadow-xl active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}
                        `}
                    >
                        Finalizar Importação
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
