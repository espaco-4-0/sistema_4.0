import { DragEvent, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/ui/components/ui/dialog";
import { Download, FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

interface ImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

export function ImportCSVModal({ isOpen, onClose, onImportSuccess }: Readonly<ImportCSVModalProps>) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        toast.success("Download do modelo iniciado!");

        const headers = ["Nome", "E-mail", "Tipo", "Status"];
        const exampleRow = ["Maria Silva", "maria@exemplo.com", "Aluno", "Ativo"];
        const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "modelo_importacao_usuarios.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleImportSubmit = () => {
        if (!file) return;

        const fileName = file.name;
        onClose();
        const toastId = toast.loading("Iniciando processamento...");

        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;

            if (progress >= 100) {
                clearInterval(interval);

                toast.success("Importação concluída!", {
                    id: toastId,
                    description: `Todos os usuários de "${fileName}" foram processados.`,
                });

                onImportSuccess?.();
                setFile(null);
            } else {
                toast.loading(
                    <div className="flex flex-col gap-2 w-full pr-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-gray-800">Processando arquivo...</span>
                            <span className="text-xs font-bold text-yellow-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-yellow-400 h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 truncate">{fileName}</span>
                    </div>,
                    { id: toastId }
                );
            }
        }, 400);
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
            toast.info(`Arquivo "${selectedFile.name}" pronto para importação.`);
        } else {
            toast.error("Formato inválido. Por favor, envie um arquivo .CSV");
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none shadow-2xl bg-white">
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
                                Utilize nosso modelo CSV para garantir o formato correto.
                            </p>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:cursor-pointer"
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
                            onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (selectedFile) handleFile(selectedFile);
                            }}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2">
                                    <FileText size={32} />
                                </div>
                                <p className="text-gray-900 font-semibold text-sm truncate max-w-60">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                        toast.info("Arquivo removido.");
                                    }}
                                    className="flex items-center gap-1 text-red-500 text-xs mt-3 font-medium hover:bg-red-50 px-2 py-1 hover:cursor-pointer rounded-md transition"
                                >
                                    <X size={14} /> Remover arquivo
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-100 p-3 rounded-full text-gray-400">
                                    <UploadCloud size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">Faça Upload do Arquivo CSV</p>
                                    <p className="text-xs text-gray-400 mt-1">Arraste aqui ou clique para selecionar</p>
                                </div>
                                <div className="mt-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold text-xs shadow-md">
                                    Selecionar Arquivo
                                </div>
                            </>
                        )}
                    </button>
                </div>

                <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 font-semibold text-sm hover:text-gray-800 transition hover:cursor-pointer border-black"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleImportSubmit}
                        disabled={!file}
                        className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:cursor-pointer
                            ${
                                file
                                    ? "bg-gray-900 text-white hover:bg-black hover:shadow-xl active:scale-95 cursor-pointer"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            }
                        `}
                    >
                        Finalizar Importação
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
