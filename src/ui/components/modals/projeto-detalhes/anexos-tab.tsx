import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { FileText, Paperclip } from "lucide-react";

const anexoStyles = {
    PDF: { bg: "bg-red-100", icon: "text-red-600" },
    IMG: { bg: "bg-blue-100", icon: "text-blue-600" },
    VIDEO: { bg: "bg-purple-100", icon: "text-purple-600" },
    CODE: { bg: "bg-green-100", icon: "text-green-600" },
    DEFAULT: { bg: "bg-gray-100", icon: "text-gray-600" },
} as const;

interface AnexosTabProps {
    projeto: ProjetoResumo;
}

export function AnexosTab({ projeto }: Readonly<AnexosTabProps>) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Documentos e Arquivos</h3>
            {projeto.anexos.length > 0 ? (
                projeto.anexos.map((anexo) => {
                    const styles = anexoStyles[anexo.tipo as keyof typeof anexoStyles] ?? anexoStyles.DEFAULT;

                    return (
                        <div
                            key={anexo.id}
                            className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer"
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${styles.bg}`}>
                                <FileText className={`w-6 h-6 ${styles.icon}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{anexo.nome}</h4>
                                <p className="text-sm text-gray-600">
                                    {anexo.tipo} • {anexo.tamanho}
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors hover:cursor-pointer text-sm font-medium">
                                Baixar
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-12">
                    <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum anexo disponível</p>
                </div>
            )}
        </div>
    );
}
