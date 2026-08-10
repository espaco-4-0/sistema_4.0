"use client";

import { OverviewAlert } from "@/src/infra/modules/professor/dashboard.service";
import { useOverview } from "@/src/ui/modules/teacher_pages/queries/dashboard.queries";
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    FolderKanban,
    Loader2,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ALERT_ICONS: Record<string, typeof AlertCircle> = {
    "project-requests": ClipboardList,
    visits: CalendarClock,
    "courses-without-lessons": FolderKanban,
    inventory: Package,
};

function alertSeverity(alert: OverviewAlert) {
    // Solicitações paradas travam alunos; as demais são avisos de organização.
    const urgente = alert.id === "project-requests" || alert.id === "visits";

    return urgente
        ? { label: "Urgente", badge: "bg-red-100 text-red-700", bg: "bg-red-100", icon: "text-red-600" }
        : { label: "Aviso", badge: "bg-yellow-100 text-yellow-700", bg: "bg-yellow-100", icon: "text-yellow-600" };
}

function TrendLabel({ changePercent }: Readonly<{ changePercent: number | null }>) {
    if (changePercent === null) {
        return <p className="text-xs text-gray-400 mt-1">Sem base de comparação</p>;
    }

    const positivo = changePercent >= 0;
    const Icon = positivo ? TrendingUp : TrendingDown;

    return (
        <p className={`text-xs mt-1 flex items-center gap-1 ${positivo ? "text-green-600" : "text-red-600"}`}>
            <Icon className="w-3 h-3" />
            {positivo ? "+" : ""}
            {changePercent}% vs. mês anterior
        </p>
    );
}

export function VisaoGeral() {
    const { data: session, status } = useSession();
    const { data: overview, isLoading, isError } = useOverview();

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
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando indicadores...
            </div>
        );
    }

    if (isError || !overview) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
                <AlertCircle size={40} className="text-red-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Não foi possível carregar os indicadores</h3>
                <p className="text-gray-500 mt-1 text-sm">Tente recarregar a página.</p>
            </div>
        );
    }

    const { metrics, series, alerts } = overview;

    const metricCards = [
        {
            title: "Total de Estudantes",
            value: String(metrics.students.total),
            changePercent: metrics.students.changePercent,
            subtitle: `${metrics.students.newThisMonth} novo(s) neste mês`,
            icon: Users,
            color: "bg-blue-100",
            iconColor: "text-blue-700",
        },
        {
            title: "Projetos Ativos",
            value: String(metrics.activeProjects.total),
            changePercent: metrics.activeProjects.changePercent,
            subtitle: `${metrics.activeProjects.newThisMonth} criado(s) neste mês`,
            icon: FolderKanban,
            color: "bg-yellow-100",
            iconColor: "text-yellow-700",
        },
        {
            title: "Taxa de Presença",
            value: `${metrics.attendanceRate.percent}%`,
            changePercent: null,
            subtitle: `${metrics.attendanceRate.confirmed} de ${metrics.attendanceRate.total} presenças`,
            icon: CheckCircle2,
            color: "bg-green-100",
            iconColor: "text-green-700",
        },
        {
            title: "Pendências",
            value: String(metrics.pending.total),
            changePercent: null,
            subtitle: "Requerem atenção",
            icon: AlertCircle,
            color: "bg-red-100",
            iconColor: "text-red-700",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <div
                            key={metric.title}
                            className="bg-white rounded-xl p-6 border border-gray-100 border-b-4 border-b-transparent transition-all duration-300 hover:border-gray-200 hover:border-b-yellow-primary"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                                    <h3 className="text-3xl font-bold">{metric.value}</h3>
                                    {metric.changePercent === null ? (
                                        <p className="text-xs text-gray-400 mt-1">{metric.subtitle}</p>
                                    ) : (
                                        <TrendLabel changePercent={metric.changePercent} />
                                    )}
                                </div>

                                <div className={`${metric.color} p-3 rounded-lg`}>
                                    <Icon className={`w-7 h-7 ${metric.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-1">Atividade do Espaço 4.0</h3>
                        <p className="text-sm text-gray-500">Projetos e estudantes ativos por mês</p>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={series}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Estudantes" fill="#FDC700" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Projetos" fill="#1F2937" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-1">Alertas e Notificações</h3>
                        <p className="text-sm text-gray-500">Itens que requerem atenção</p>
                    </div>

                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Nada pendente</p>
                            <p className="text-xs text-gray-400 mt-1">Tudo em dia por aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => {
                                const Icon = ALERT_ICONS[alert.id] ?? AlertCircle;
                                const severity = alertSeverity(alert);

                                return (
                                    <Link
                                        key={alert.id}
                                        href={alert.href}
                                        className="block border border-gray-100 rounded-lg p-4 hover:border-gray-300 transition"
                                    >
                                        <div className="flex gap-3">
                                            <div className={`${severity.bg} p-2 rounded-lg h-fit`}>
                                                <Icon className={`w-5 h-5 ${severity.icon}`} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-medium text-sm">{alert.title}</h4>
                                                    <span className={`text-xs px-2 py-1 rounded ${severity.badge}`}>
                                                        {severity.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {alert.count} {alert.count === 1 ? "item" : "itens"}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
