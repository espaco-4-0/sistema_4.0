import { AnexosTab } from "@/src/ui/components/modals/projeto-detalhes/anexos-tab";
import { EquipeTab } from "@/src/ui/components/modals/projeto-detalhes/equipe-tab";
import { ModalHeader } from "@/src/ui/components/modals/projeto-detalhes/modal-header";
import { TarefasTab } from "@/src/ui/components/modals/projeto-detalhes/tarefas-tab";
import { VisaoGeralTab } from "@/src/ui/components/modals/projeto-detalhes/visao-geral-tab";
import { ProjetoDetalhesModalProps } from "@/src/ui/components/props/professor/props";
import { ListTodo, Paperclip, Target, Users } from "lucide-react";

import { Dialog, DialogContent } from "../ui/dialog";

const tabs = [
    { id: "visao-geral", label: "Visão Geral", icon: Target },
    { id: "tarefas", label: "Tarefas", icon: ListTodo },
    { id: "equipe", label: "Equipe", icon: Users },
    { id: "anexos", label: "Anexos", icon: Paperclip },
];

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
                <ModalHeader projeto={projeto} />

                <div className="border-b border-gray-200 px-6">
                    <div className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors hover:cursor-pointer whitespace-nowrap ${
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
