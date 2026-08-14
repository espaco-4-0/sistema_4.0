"use client";

import { useState } from "react";
import {
    CERTIFICATE_TYPE_LABELS,
    ISSUANCE_STATUS_LABELS,
    ISSUANCE_STATUS_STYLES,
    type CertificateTemplateItem,
} from "@/src/infra/modules/professor/certificates.service";
import { SignatureModal } from "@/src/ui/components/modals/professor/certificados/signature-modal";
import { TemplateFormModal } from "@/src/ui/components/modals/professor/certificados/template-form-modal";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    useCertificateMetrics,
    useCertificateTemplates,
    useEmitBulk,
    useEmitSingle,
    useIssuances,
    useSignature,
} from "@/src/ui/modules/teacher_pages/queries/certificates.queries";
import {
    AlertCircle,
    Award,
    ChevronLeft,
    ChevronRight,
    Loader2,
    PenLine,
    Plus,
    ShieldCheck,
    Star,
    Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["COMPLETED", "IN_PROGRESS", "PENDING"];

export default function Certificados() {
    const { data: session, status } = useSession();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("todos");
    const [templateId, setTemplateId] = useState<string>("");
    const [selected, setSelected] = useState<string[]>([]);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CertificateTemplateItem | null>(null);
    const [isSignatureOpen, setIsSignatureOpen] = useState(false);

    const { data: metrics } = useCertificateMetrics();
    const { data: templates = [] } = useCertificateTemplates();
    const { data: signature } = useSignature();
    const { data: issuances, isLoading } = useIssuances({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: statusFilter === "todos" ? undefined : statusFilter,
    });

    const emitSingle = useEmitSingle();
    const emitBulk = useEmitBulk();

    if (status === "loading") return null;

    if (!session || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Certificados são exclusivos para administradores e professores.
                </p>
            </div>
        );
    }

    const rows = issuances?.data ?? [];
    const pagination = issuances?.pagination;
    const templateSelecionado = templateId || templates[0]?.id || "";

    const cards = [
        {
            title: "Total gerados",
            value: metrics?.totalGenerated ?? 0,
            icon: Award,
            color: "bg-green-100",
            iconColor: "text-green-700",
        },
        {
            title: "Participação",
            value: metrics?.participationCount ?? 0,
            icon: Users,
            color: "bg-yellow-100",
            iconColor: "text-yellow-700",
        },
        {
            title: "Conclusão",
            value: metrics?.completionCount ?? 0,
            icon: ShieldCheck,
            color: "bg-purple-100",
            iconColor: "text-purple-700",
        },
        {
            title: "Excelência",
            value: metrics?.excellenceCount ?? 0,
            icon: Star,
            color: "bg-red-100",
            iconColor: "text-red-700",
        },
    ];

    // Só faz sentido emitir para quem ainda não tem certificado.
    const elegiveis = rows.filter((row) => row.status !== "COMPLETED");
    const todosSelecionados = elegiveis.length > 0 && elegiveis.every((row) => selected.includes(row.id));

    function toggleAll() {
        setSelected(todosSelecionados ? [] : elegiveis.map((row) => row.id));
    }

    function handleEmitSingle(issuanceId: string) {
        if (!templateSelecionado) {
            toast.error("Cadastre um template antes de emitir.");
            return;
        }
        emitSingle.mutate({ issuanceId, templateId: templateSelecionado });
    }

    function handleEmitBulk() {
        if (!templateSelecionado) {
            toast.error("Cadastre um template antes de emitir.");
            return;
        }
        if (selected.length === 0) {
            toast.error("Selecione ao menos um aluno.");
            return;
        }

        emitBulk.mutate(
            { issuanceIds: selected, templateId: templateSelecionado },
            { onSuccess: () => setSelected([]) }
        );
    }

    return (
        <>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Certificados</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Gerencie templates, assinatura e emissão para os alunos matriculados.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2" onClick={() => setIsSignatureOpen(true)}>
                            <PenLine size={16} />
                            {signature ? "Editar assinatura" : "Configurar assinatura"}
                        </Button>
                        <Button
                            className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                            onClick={() => {
                                setEditingTemplate(null);
                                setIsTemplateOpen(true);
                            }}
                        >
                            <Plus size={16} /> Novo template
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((item) => {
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

                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Templates</h3>
                            <p className="text-gray-500 text-sm">Modelos disponíveis para emissão</p>
                        </div>
                    </div>

                    {templates.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6 border border-dashed rounded-lg">
                            Nenhum template cadastrado. Crie o primeiro para poder emitir certificados.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                        setEditingTemplate(template);
                                        setIsTemplateOpen(true);
                                    }}
                                    className="border rounded-xl p-4 flex items-center gap-3 text-left hover:border-gray-300 transition"
                                >
                                    <div
                                        className="w-16 h-10 rounded-lg border border-yellow-200 shrink-0"
                                        style={{
                                            backgroundColor:
                                                (template.layout?.corFundo as string | undefined) ?? "#FFFDF0",
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{template.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {CERTIFICATE_TYPE_LABELS[template.type] ?? template.type} ·{" "}
                                            {template._count?.emissoes ?? 0} emissão(ões)
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Alunos e emissões</h3>
                                <p className="text-gray-500 text-sm">
                                    {pagination?.total ?? 0} matrícula(s) encontradas
                                </p>
                            </div>

                            <Button
                                onClick={handleEmitBulk}
                                disabled={selected.length === 0 || emitBulk.isPending}
                                className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                            >
                                <Award size={16} />
                                {emitBulk.isPending ? "Emitindo..." : `Emitir em lote (${selected.length})`}
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                className="h-10 flex-1"
                                placeholder="Buscar por aluno ou curso..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />

                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 w-full sm:w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os status</SelectItem>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {ISSUANCE_STATUS_LABELS[option]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {templates.length > 0 ? (
                                <Select value={templateSelecionado} onValueChange={setTemplateId}>
                                    <SelectTrigger className="h-10 w-full sm:w-56">
                                        <SelectValue placeholder="Template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : null}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Nenhuma matrícula encontrada</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                aria-label="Selecionar todos"
                                                checked={todosSelecionados}
                                                onChange={toggleAll}
                                                disabled={elegiveis.length === 0}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Aluno
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Curso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Selecionar ${row.studentName}`}
                                                    checked={selected.includes(row.id)}
                                                    disabled={row.status === "COMPLETED"}
                                                    onChange={(e) =>
                                                        setSelected((prev) =>
                                                            e.target.checked
                                                                ? [...prev, row.id]
                                                                : prev.filter((id) => id !== row.id)
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {row.studentName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{row.courseName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                        ISSUANCE_STATUS_STYLES[row.status]
                                                    }`}
                                                >
                                                    {ISSUANCE_STATUS_LABELS[row.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    disabled={
                                                        row.status === "COMPLETED" ||
                                                        emitSingle.isPending ||
                                                        templates.length === 0
                                                    }
                                                    onClick={() => handleEmitSingle(row.id)}
                                                >
                                                    {row.status === "COMPLETED" ? "Emitido" : "Emitir"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination && pagination.totalPages > 1 ? (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <p className="text-sm text-gray-500">
                                Página {pagination.page} de {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Página anterior"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Próxima página"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <TemplateFormModal
                isOpen={isTemplateOpen}
                onClose={() => setIsTemplateOpen(false)}
                templateToEdit={editingTemplate}
            />
            <SignatureModal
                isOpen={isSignatureOpen}
                onClose={() => setIsSignatureOpen(false)}
                signature={signature ?? null}
            />
        </>
    );
}
