import { statusConfig } from "@/src/infra/modules/professor/gerenciar-projetos-mock";
import { ProjetoDetalhesModalProps, ProjetoResumo } from "@/src/ui/components/props/professor/props";
import {
    Archive,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    FileText,
    ListTodo,
    MessageSquare,
    MoreVertical,
    Paperclip,
    Share2,
    Target,
    TrendingUp,
    User,
    Users,
    X,
    Zap,
} from "lucide-react";

import { Dialog, DialogContent } from "../ui/dialog";

const tabs = [
    { id: "visao-geral", label: "Visão Geral", icon: Target },
    { id: "tarefas", label: "Tarefas", icon: ListTodo },
    { id: "equipe", label: "Equipe", icon: Users },
    { id: "anexos", label: "Anexos", icon: Paperclip },
];

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

const anexoStyles = {
    PDF: { bg: "bg-red-100", icon: "text-red-600" },
    IMG: { bg: "bg-blue-100", icon: "text-blue-600" },
    VIDEO: { bg: "bg-purple-100", icon: "text-purple-600" },
    CODE: { bg: "bg-green-100", icon: "text-green-600" },
    DEFAULT: { bg: "bg-gray-100", icon: "text-gray-600" },
} as const;

function VisaoGeralTab({
    projeto,
    tarefasConcluidas,
}: Readonly<{ projeto: ProjetoResumo; tarefasConcluidas: number }>) {
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

function TarefasTab({ projeto, tarefasConcluidas }: Readonly<{ projeto: ProjetoResumo; tarefasConcluidas: number }>) {
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

function EquipeTab({ projeto }: Readonly<{ projeto: ProjetoResumo }>) {
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

function AnexosTab({ projeto }: Readonly<{ projeto: ProjetoResumo }>) {
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
                            <button className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium">
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

export function ProjetoDetalhesModal({
    open,
    projeto,
    activeTab,
    onTabChange,
    onClose,
}: Readonly<ProjetoDetalhesModalProps>) {
    if (!projeto) return null;

    const tarefasConcluidas = projeto.tarefas.filter((tarefa) => tarefa.status === "concluida").length;
    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden">
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
                                <span
                                    className={`text-xs px-3 py-1 rounded-full ${statusConfig[projeto.status].color}`}
                                >
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

                <div className="border-b border-gray-200 px-6">
                    <div className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "border-yellow-400 text-yellow-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
                    {activeTab === "visao-geral" && (
                        <VisaoGeralTab projeto={projeto} tarefasConcluidas={tarefasConcluidas} />
                    )}
                    {activeTab === "tarefas" && <TarefasTab projeto={projeto} tarefasConcluidas={tarefasConcluidas} />}
                    {activeTab === "equipe" && <EquipeTab projeto={projeto} />}
                    {activeTab === "anexos" && <AnexosTab projeto={projeto} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
