import { statusConfig } from "@/src/infra/modules/professor/gerenciar-projetos-mock";
import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { Archive, Edit, Share2 } from "lucide-react";

interface ModalHeaderProps {
    projeto: ProjetoResumo;
}

export function ModalHeader({ projeto }: Readonly<ModalHeaderProps>) {
    return (
        <div className="bg-linear-to-r from-yellow-400 to-yellow-500 p-6 text-gray-900">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{projeto.nome}</h2>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black text-yellow-400">
                            {projeto.categoria.toLowerCase().includes("pesquisa")
                                ? "Projeto de Pesquisa"
                                : "Projeto de Extensão"}
                        </span>
                    </div>
                    <p className="text-gray-800 mb-3">{projeto.descricao}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 bg-white bg-opacity-30 rounded-full">
                            {projeto.categoria}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[projeto.status].color}`}>
                            {statusConfig[projeto.status].label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                </button>
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Compartilhar</span>
                </button>
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                    <Archive className="w-4 h-4" />
                    <span className="text-sm">Arquivar</span>
                </button>
            </div>
        </div>
    );
}
