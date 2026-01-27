import { useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface ImportarRecursosModalProps {
    open: boolean;
    onClose: () => void;
}

export function ImportarRecursosModal({ open, onClose }: ImportarRecursosModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null); 	
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "text/csv") {
            setSelectedFile(file);
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
        if (file && file.type === "text/csv") {
            setSelectedFile(file);
        }
    };

    const handleDownloadTemplate = () => {
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
        console.log("Importing file:", selectedFile);
        onClose();
        setSelectedFile(null);
    };

    const handleCancel = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-125 p-0">
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
                            <DialogTitle className="text-xl font-semibold">Importar Recursos em Massa</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Adicione múltiplos recursos de uma vez através de um arquivo estruturado.
                            </p>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                                        <Download className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm text-gray-900">Baixe o Template</h3>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Utilize nosso modelo CSV para garantir o formato correto.
                                        </p>
                                        <Button
                                            variant="ghost"
                                            className="mt-3 h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium text-sm"
                                            onClick={handleDownloadTemplate}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Baixar Template CSV
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-gray-100 rounded-full p-3 mb-4">
                                        <Upload className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Faça Upload do Arquivo CSV</h3>
                                    <p className="text-sm text-gray-500 mb-4">Arraste aqui ou clique para selecionar</p>
                                    {selectedFile ? (
                                        <div className="text-sm text-green-600 font-medium mb-4">
                                            ✓ {selectedFile.name}
                                        </div>
                                    ) : null}
                                    <label htmlFor="file-upload">
                                        <Button
                                            type="button"
                                            className="bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 font-medium"
                                            onClick={() => document.getElementById("file-upload")?.click()}
                                        >
                                            Selecionar Arquivo
                                        </Button>
                                    </label>
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
                        <Button variant="ghost" onClick={handleCancel} className="text-gray-700 hover:bg-gray-100">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={!selectedFile}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Finalizar Importação
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
