import { useState } from "react";
import { Download, FileText, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";

interface ImportarRecursosModalProps {
    open: boolean;
    onClose: () => void;
}

export function ImportarRecursosModal({ open, onClose }: Readonly<ImportarRecursosModalProps>) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
            setSelectedFile(file);
            toast.info(`Arquivo "${file.name}" pronto para importação.`);
        } else if (file) {
            toast.error("Formato inválido. Por favor, envie um arquivo .CSV");
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
            setSelectedFile(file);
            toast.info(`Arquivo "${file.name}" pronto para importação.`);
        } else if (file) {
            toast.error("Formato inválido. Por favor, envie um arquivo .CSV");
        }
    };

    const handleDownloadTemplate = () => {
        toast.success("Download do modelo iniciado!");

        const csvContent =
            "nome,categoria,qtd_total,localizacao\nArduino Uno R3,Microcontroladores,25,Prateleira A1\nRaspberry Pi 4,Computadores,10,Prateleira A2";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_recursos.csv";
        a.click();
        globalThis.URL.revokeObjectURL(url);
    };

    const handleFinalize = () => {
        if (!selectedFile) return;

        const fileName = selectedFile.name;
        onClose();
        const toastId = toast.loading("Iniciando processamento...");

        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;

            if (progress >= 100) {
                clearInterval(interval);

                toast.success("Importação concluída!", {
                    id: toastId,
                    description: `Todos os recursos de "${fileName}" foram processados.`,
                });

                setSelectedFile(null);
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

    const handleCancel = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </button>

                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-gray-800 ">Importar Recursos em Massa</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Adicione múltiplos recursos de uma vez através de um arquivo estruturado.
                            </p>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            <div className="flex items-start gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Download className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900">Baixe o Template</p>
                                    <p className="text-xs text-blue-700/80 mb-3">
                                        Utilize nosso modelo CSV para garantir o formato correto.
                                    </p>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:cursor-pointer transition-all shadow-sm"
                                        onClick={handleDownloadTemplate}
                                    >
                                        <Download className="h-4 w-4" />
                                        Baixar Template CSV
                                    </Button>
                                </div>
                            </div>

                            <button
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
                                    flex flex-col items-center justify-center gap-3 w-full
                                    ${isDragging ? "border-yellow-400 bg-yellow-50/50" : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"}
                                    ${selectedFile ? "border-green-200 bg-green-50/30" : ""}
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <div
                                    className={`p-3 rounded-full mb-2 transition-colors ${
                                        selectedFile ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700">
                                            Faça Upload do Arquivo CSV
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Arraste aqui ou clique para selecionar
                                        </p>
                                    </div>
                                    {selectedFile ? (
                                        <div className="text-sm text-green-600 font-medium mt-2">
                                            ✓ {selectedFile.name}
                                        </div>
                                    ) : (
                                        <div className="mt-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold text-xs shadow-md">
                                            Selecionar Arquivo
                                        </div>
                                    )}
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="text-gray-700 hover:bg-gray-100 hover:cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={!selectedFile}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all hover:cursor-pointer shadow-lg
                                ${
                                    selectedFile
                                        ? "bg-gray-900 text-white hover:bg-black hover:shadow-xl active:scale-95"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                }
                            `}
                        >
                            Finalizar Importação
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
