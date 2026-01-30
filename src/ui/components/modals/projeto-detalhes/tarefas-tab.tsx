import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { Calendar, CheckCircle, Clock, User } from "lucide-react";

const tarefaStatusMeta = {
    concluida: {
        label: "Concluída",
        chip: "bg-green-100 text-green-700",
        dot: "bg-green-100",
        icon: CheckCircle,
    },
    "em-andamento": {
        label: "Em Andamento",
        chip: "bg-blue-100 text-blue-700",
        dot: "bg-blue-100",
        icon: Clock,
    },
    pendente: {
        label: "Pendente",
        chip: "bg-gray-200 text-gray-700",
        dot: "bg-gray-200",
        icon: null,
    },
} as const;

interface TarefasTabProps {
    projeto: ProjetoResumo;
    tarefasConcluidas: number;
}

export function TarefasTab({ projeto, tarefasConcluidas }: Readonly<TarefasTabProps>) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Todas as Tarefas</h3>
                <span className="text-sm text-gray-600">
                    {tarefasConcluidas} de {projeto.tarefas.length} concluídas
                </span>
            </div>
            {projeto.tarefas.map((tarefa) => {
                const statusMeta = tarefaStatusMeta[tarefa.status];
                const StatusIcon = statusMeta.icon;

                return (
                    <div key={tarefa.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div
                                    className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${statusMeta.dot}`}
                                >
                                    {StatusIcon ? <StatusIcon className="w-4 h-4 text-current" /> : null}
                                </div>
                                <div className="flex-1">
                                    <h4
                                        className={`font-medium mb-1 ${
                                            tarefa.status === "concluida"
                                                ? "line-through text-gray-500"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        {tarefa.titulo}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {tarefa.responsavel}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {tarefa.prazo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusMeta.chip}`}>
                                {statusMeta.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
