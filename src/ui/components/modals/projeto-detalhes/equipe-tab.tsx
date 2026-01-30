import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { MoreVertical } from "lucide-react";

interface EquipeTabProps {
    projeto: ProjetoResumo;
}

export function EquipeTab({ projeto }: Readonly<EquipeTabProps>) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Membros da Equipe</h3>
            {projeto.membros.map((membro) => (
                <div
                    key={membro.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-semibold text-gray-900">
                        {membro.avatar}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{membro.nome}</h4>
                        <p className="text-sm text-gray-600">{membro.papel}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            ))}

            {projeto.orientador && (
                <>
                    <h3 className="font-semibold text-gray-900 mb-4 mt-6">Orientador</h3>
                    <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-semibold text-gray-900">
                            {projeto.orientador
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{projeto.orientador}</h4>
                            <p className="text-sm text-gray-600">Orientador do Projeto</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
