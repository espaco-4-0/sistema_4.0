import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { Calendar, CheckCircle, DollarSign, MessageSquare, Target, TrendingUp, Zap } from "lucide-react";

interface VisaoGeralTabProps {
    projeto: ProjetoResumo;
    tarefasConcluidas: number;
}

export function VisaoGeralTab({ projeto, tarefasConcluidas }: Readonly<VisaoGeralTabProps>) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600">Progresso</span>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{projeto.progresso}%</p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${projeto.progresso}%` }} />
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600">Tarefas</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                        {tarefasConcluidas}/{projeto.tarefas.length}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                        {Math.round((tarefasConcluidas / projeto.tarefas.length) * 100)}% concluídas
                    </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-600">Orçamento</span>
                        <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                        {Math.round((projeto.gastoAtual / projeto.orcamento) * 100)}%
                    </p>
                    <p className="text-xs text-purple-700 mt-1">R$ {projeto.gastoAtual.toLocaleString()} usado</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-yellow-500" />
                        Objetivos do Projeto
                    </h3>
                    <ul className="space-y-2">
                        {projeto.objetivos.map((objetivo) => (
                            <li key={objetivo} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{objetivo}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Tecnologias Utilizadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {projeto.tecnologias.map((tech) => (
                            <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    Cronograma
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-gray-600">Data de Início</p>
                            <p className="font-semibold text-gray-900">{projeto.dataInicio}</p>
                        </div>
                        <div className="flex-1 mx-4">
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-2 bg-yellow-400 rounded-full"
                                    style={{ width: `${projeto.progresso}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600">Prazo Final</p>
                            <p className="font-semibold text-gray-900">{projeto.prazo}</p>
                        </div>
                    </div>
                </div>
            </div>

            {projeto.comentarios.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-yellow-500" />
                        Comentários Recentes
                    </h3>
                    <div className="space-y-3">
                        {projeto.comentarios.map((comentario) => (
                            <div key={comentario.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="font-medium text-gray-900">{comentario.autor}</span>
                                    <span className="text-xs text-gray-500">{comentario.data}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comentario.texto}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
