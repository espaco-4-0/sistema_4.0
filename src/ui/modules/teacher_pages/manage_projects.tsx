import { useState } from "react";
import { projetos, statusConfig } from "@/src/infra/modules/professor/gerenciar-projetos-mock";
import { ProjetoDetalhesModal } from "@/src/ui/components/modals/projeto-detalhes-modal";
import { ProjetoResumo } from "@/src/ui/components/props/professor/props";
import { AlertCircle, ChevronRight, DollarSign, ListTodo, Search, User, Users } from "lucide-react";
import { useSession } from "next-auth/react";

export function ManageProjects() {
    const { data: session, status } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("todos");
    const [selectedProjeto, setSelectedProjeto] = useState<ProjetoResumo | null>(null);
    const [activeTab, setActiveTab] = useState("visao-geral");

    const filteredProjetos = projetos.filter((projeto) => {
        const matchesSearch =
            projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            projeto.estudante.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "todos" || projeto.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (status === "loading") return null;

    if (!session || session.user.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Esta página e suas funcionalidades são exclusivas para administradores do sistema.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar projetos ou estudantes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:cursor-pointer "
                >
                    <option value="todos">Todos os Status</option>
                    <option value="em-andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="pendente">Pendente</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjetos.map((projeto) => {
                    const StatusIcon = statusConfig[projeto.status].icon;
                    const tarefasConcluidas = projeto.tarefas.filter((t) => t.status === "concluida").length;
                    const totalTarefas = projeto.tarefas.length;

                    return (
                        <button
                            key={projeto.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setSelectedProjeto(projeto)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">{projeto.nome}</h3>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{projeto.descricao}</p>
                                    <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                        {projeto.categoria}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Estudante:</span>
                                    <span className="font-medium">{projeto.estudante}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Equipe:</span>
                                    <div className="flex -space-x-2">
                                        {projeto.membros.slice(0, 3).map((membro) => (
                                            <div
                                                key={membro.id}
                                                className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-medium"
                                                title={membro.nome}
                                            >
                                                {membro.avatar}
                                            </div>
                                        ))}
                                        {projeto.membros.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                                +{projeto.membros.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ListTodo className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Tarefas:</span>
                                    <span className="font-medium">
                                        {tarefasConcluidas}/{totalTarefas} concluídas
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Orçamento:</span>
                                    <span className="font-medium">
                                        R$ {projeto.gastoAtual.toLocaleString()} / R${" "}
                                        {projeto.orcamento.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">Progresso</span>
                                    <span className="font-medium">{projeto.progresso}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${projeto.progresso}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StatusIcon className="w-4 h-4" />
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full ${statusConfig[projeto.status].color}`}
                                    >
                                        {statusConfig[projeto.status].label}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">Prazo: {projeto.prazo}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <ProjetoDetalhesModal
                open={Boolean(selectedProjeto)}
                projeto={selectedProjeto}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => {
                    setSelectedProjeto(null);
                    setActiveTab("visao-geral");
                }}
            />
        </div>
    );
}
