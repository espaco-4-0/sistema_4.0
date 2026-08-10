"use client";

import { useState } from "react";
import {
    PROJECT_STATUS_LABELS,
    PROJECT_STATUS_STYLES,
    REQUEST_STATUS_LABELS,
    type ProjectItem,
    type ProjectRequestItem,
} from "@/src/infra/modules/professor/projects-admin.service";
import { ProjectDetailModal } from "@/src/ui/components/modals/professor/projetos/project-detail-modal";
import { RejectRequestModal } from "@/src/ui/components/modals/professor/projetos/reject-request-modal";
import { Input } from "@/src/ui/components/ui/input";
import {
    useApproveRequest,
    useProjectRequests,
    useProjects,
} from "@/src/ui/modules/teacher_pages/queries/projects.queries";
import { AlertCircle, Check, ClipboardList, FolderKanban, Loader2, Paperclip, Search, Users, X } from "lucide-react";
import { useSession } from "next-auth/react";

type Tab = "solicitacoes" | "projetos";

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

export default function ManageProjects() {
    const { data: session, status } = useSession();
    const [tab, setTab] = useState<Tab>("solicitacoes");
    const [search, setSearch] = useState("");
    const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);
    const [rejecting, setRejecting] = useState<ProjectRequestItem | null>(null);

    const { data: requests = [], isLoading: loadingRequests } = useProjectRequests();
    const { data: projects = [], isLoading: loadingProjects } = useProjects();
    const approveMutation = useApproveRequest();

    if (status === "loading") return null;

    if (!session || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Apenas administradores e professores podem gerenciar projetos.
                </p>
            </div>
        );
    }

    const termo = search.trim().toLowerCase();

    const pendentes = requests.filter((r) => r.status === "PENDING");
    const requestsFiltradas = requests.filter(
        (r) =>
            !termo ||
            r.title.toLowerCase().includes(termo) ||
            (r.createdBy?.fullName ?? "").toLowerCase().includes(termo)
    );
    const projetosFiltrados = projects.filter(
        (p) =>
            !termo || p.title.toLowerCase().includes(termo) || (p.leader?.fullName ?? "").toLowerCase().includes(termo)
    );

    const stats = [
        {
            title: "Solicitações pendentes",
            value: pendentes.length,
            icon: ClipboardList,
            color: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: "Projetos",
            value: projects.length,
            icon: FolderKanban,
            color: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Em andamento",
            value: projects.filter((p) => p.status === "IN_PROGRESS").length,
            icon: Loader2,
            color: "bg-purple-50",
            iconColor: "text-purple-600",
        },
        {
            title: "Concluídos",
            value: projects.filter((p) => p.status === "COMPLETED").length,
            icon: Check,
            color: "bg-green-50",
            iconColor: "text-green-600",
        },
    ];

    return (
        <>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Gerenciar Projetos</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Analise solicitações e acompanhe os projetos do Espaço 4.0.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{item.title}</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
                                    </div>
                                    <div className={`${item.color} p-3 rounded-lg`}>
                                        <Icon className={`w-7 h-7 ${item.iconColor}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTab("solicitacoes")}
                            className={`px-4 h-10 rounded-lg text-sm font-medium transition ${
                                tab === "solicitacoes"
                                    ? "bg-yellow-400 text-gray-900"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Solicitações {pendentes.length > 0 ? `(${pendentes.length})` : ""}
                        </button>
                        <button
                            onClick={() => setTab("projetos")}
                            className={`px-4 h-10 rounded-lg text-sm font-medium transition ${
                                tab === "projetos"
                                    ? "bg-yellow-400 text-gray-900"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Projetos
                        </button>
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-9 h-10"
                            placeholder="Buscar por título ou responsável..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {tab === "solicitacoes" ? (
                    <div className="space-y-4">
                        {loadingRequests ? (
                            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Carregando solicitações...
                            </div>
                        ) : requestsFiltradas.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
                                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Nenhuma solicitação</p>
                            </div>
                        ) : (
                            requestsFiltradas.map((request) => (
                                <div key={request.id} className="bg-white rounded-xl border border-gray-100 p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{request.title}</h3>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full border ${
                                                        request.status === "PENDING"
                                                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                            : request.status === "APPROVED"
                                                              ? "bg-green-50 text-green-700 border-green-200"
                                                              : "bg-red-50 text-red-700 border-red-200"
                                                    }`}
                                                >
                                                    {REQUEST_STATUS_LABELS[request.status] ?? request.status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                <strong>Objetivo:</strong> {request.objective}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                <span>Por: {request.createdBy?.fullName ?? "—"}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {request.members.length} integrante(s)
                                                </span>
                                                <span>{formatDate(request.createdAt)}</span>
                                            </div>

                                            {request.rejectionReason ? (
                                                <p className="text-xs text-red-600 mt-3 bg-red-50 rounded-lg p-3">
                                                    <strong>Motivo da recusa:</strong> {request.rejectionReason}
                                                </p>
                                            ) : null}
                                        </div>

                                        {request.status === "PENDING" ? (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => approveMutation.mutate({ id: request.id })}
                                                    disabled={approveMutation.isPending}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" /> Aprovar
                                                </button>
                                                <button
                                                    onClick={() => setRejecting(request)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" /> Rejeitar
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {loadingProjects ? (
                            <div className="col-span-full flex items-center justify-center py-16 text-gray-400 gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Carregando projetos...
                            </div>
                        ) : projetosFiltrados.length === 0 ? (
                            <div className="col-span-full bg-white rounded-xl border border-gray-100 py-16 text-center">
                                <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Nenhum projeto</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Projetos são criados ao aprovar uma solicitação.
                                </p>
                            </div>
                        ) : (
                            projetosFiltrados.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setDetailProject(project)}
                                    className="bg-white rounded-xl border border-gray-100 p-6 text-left hover:border-gray-300 transition"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
                                                PROJECT_STATUS_STYLES[project.status] ?? "bg-gray-100"
                                            }`}
                                        >
                                            {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                                        </span>
                                    </div>

                                    {project.description ? (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                                    ) : null}

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        <span>Líder: {project.leader?.fullName ?? "—"}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {project._count?.ProjectMember ?? 0}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            {project._count?.Task ?? 0} tarefa(s)
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            {project._count?.ProjectFile ?? 0}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            <ProjectDetailModal
                project={detailProject}
                isOpen={detailProject !== null}
                onClose={() => setDetailProject(null)}
            />

            <RejectRequestModal request={rejecting} isOpen={rejecting !== null} onClose={() => setRejecting(null)} />
        </>
    );
}
