"use client";

import React from "react";
import type { ReportsData } from "@/src/infra/modules/professor/reports.service";
import { Button } from "@/src/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import { downloadCsv, toCsv } from "@/src/ui/lib/csv";
import { useReports } from "@/src/ui/modules/teacher_pages/queries/reports.queries";
import { AlertCircle, BookOpen, CheckCircle2, Download, FolderKanban, Loader2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { toast } from "sonner";

type ChartCardProps = Readonly<{
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onExport?: () => void;
}>;

const ChartCard = ({ title, subtitle, children, onExport }: ChartCardProps) => (
    <Card className="flex flex-col h-120 shadow-sm border-gray-100 overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
            <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">{subtitle}</CardDescription>
            </div>
            {onExport ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-700"
                    onClick={onExport}
                    aria-label={`Exportar ${title}`}
                >
                    <Download className="w-5 h-5" />
                </Button>
            ) : null}
        </CardHeader>
        <CardContent className="flex-1 p-6 pt-4">{children}</CardContent>
    </Card>
);

function exportarTudo(data: ReportsData) {
    const linhas: (string | number)[][] = [
        ["RESUMO", "", ""],
        ["Projetos totais", data.resumo.projetosTotais, ""],
        ["Projetos concluídos", data.resumo.projetosConcluidos, ""],
        ["Taxa de conclusão (%)", data.resumo.taxaConclusaoPercent, ""],
        ["Estudantes ativos", data.resumo.estudantesAtivos, ""],
        ["Cursos ativos", data.resumo.cursosAtivos, ""],
        ["Matrículas", data.resumo.matriculas, ""],
        ["", "", ""],
        ["PROJETOS POR MÊS", "iniciados", "concluídos"],
        ...data.projetosPorMes.map((p) => [p.mes, p.iniciados, p.concluidos]),
        ["", "", ""],
        ["ESTUDANTES POR CURSO", "inscritos", ""],
        ...data.estudantesPorCurso.map((c) => [c.curso, c.total, ""]),
        ["", "", ""],
        ["STATUS DOS PROJETOS", "quantidade", ""],
        ...data.statusProjetos.map((s) => [s.name, s.value, ""]),
        ["", "", ""],
        ["TOP ALUNOS", "projetos", "presenças"],
        ...data.alunosMaisAtivos.map((a) => [a.nome, a.projetos, a.presencas]),
        ["", "", ""],
        ["PRESENÇA POR MÊS", "alunos distintos", "presenças"],
        ...data.presencaPorMes.map((p) => [p.mes, p.alunos, p.presencas]),
        ["", "", ""],
        ["TAREFAS POR MÊS", "concluídas", "pendentes"],
        ...data.tarefas.map((t) => [t.mes, t.concluidas, t.pendentes]),
    ];

    const hoje = new Date().toISOString().slice(0, 10);
    downloadCsv(`relatorio_espaco4_${hoje}.csv`, toCsv(["Indicador", "Valor", "Complemento"], linhas));
    toast.success("Relatório exportado.");
}

export default function RelatoriosState() {
    const { data: session, status } = useSession();
    const { data, isLoading, isError } = useReports();

    if (status === "loading") return null;

    if (!session || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Relatórios são exclusivos para administradores e professores.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Gerando relatórios...
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle size={40} className="text-red-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Não foi possível carregar os relatórios</h3>
            </div>
        );
    }

    const cards = [
        {
            title: "Projetos Totais",
            value: data.resumo.projetosTotais,
            icon: FolderKanban,
            color: "bg-blue-100",
            iconColor: "text-blue-700",
        },
        {
            title: "Taxa de Conclusão",
            value: `${data.resumo.taxaConclusaoPercent}%`,
            icon: CheckCircle2,
            color: "bg-green-100",
            iconColor: "text-green-700",
        },
        {
            title: "Estudantes Ativos",
            value: data.resumo.estudantesAtivos,
            icon: Users,
            color: "bg-yellow-100",
            iconColor: "text-yellow-700",
        },
        {
            title: "Matrículas",
            value: data.resumo.matriculas,
            icon: BookOpen,
            color: "bg-purple-100",
            iconColor: "text-purple-700",
        },
    ];

    return (
        <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-b-4 border-b-transparent hover:border-b-yellow-primary hover:border-gray-200 transition-all duration-300 flex items-start justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{item.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
                            </div>
                            <div className={`${item.color} p-3 rounded-xl`}>
                                <Icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Projetos por Mês"
                    subtitle="Iniciados vs Concluídos"
                    onExport={() =>
                        downloadCsv(
                            "projetos_por_mes.csv",
                            toCsv(
                                ["mes", "iniciados", "concluidos"],
                                data.projetosPorMes.map((p) => [p.mes, p.iniciados, p.concluidos])
                            )
                        )
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.projetosPorMes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="iniciados" name="Iniciados" fill="#FDC700" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="concluidos" name="Concluídos" fill="#1F2937" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Status dos Projetos" subtitle="Distribuição atual">
                    {data.statusProjetos.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center pt-20">Nenhum projeto cadastrado.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statusProjetos}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    label
                                >
                                    {data.statusProjetos.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard
                    title="Estudantes por Curso"
                    subtitle="Matrículas por curso ativo"
                    onExport={() =>
                        downloadCsv(
                            "estudantes_por_curso.csv",
                            toCsv(
                                ["curso", "inscritos"],
                                data.estudantesPorCurso.map((c) => [c.curso, c.total])
                            )
                        )
                    }
                >
                    {data.estudantesPorCurso.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center pt-20">Nenhum curso ativo.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.estudantesPorCurso} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="curso" width={140} />
                                <Tooltip />
                                <Bar dataKey="total" name="Inscritos" fill="#FDC700" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Taxa de Conclusão" subtitle="Acumulada por mês (%)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.taxaConclusao}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="taxa" name="Taxa (%)" stroke="#22C55E" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Presença por Mês" subtitle="Alunos distintos e presenças confirmadas">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.presencaPorMes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="alunos" name="Alunos" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="presencas" name="Presenças" fill="#FDC700" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tarefas por Mês" subtitle="Concluídas vs pendentes">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.tarefas}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="concluidas"
                                name="Concluídas"
                                stroke="#22C55E"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="pendentes"
                                name="Pendentes"
                                stroke="#EF4444"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <Card className="shadow-sm border-gray-100">
                <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gray-800">Top 5 Alunos Mais Ativos</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                            Ordenados por projetos e presenças
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-700"
                        aria-label="Exportar top alunos"
                        onClick={() =>
                            downloadCsv(
                                "top_alunos.csv",
                                toCsv(
                                    ["nome", "projetos", "presencas"],
                                    data.alunosMaisAtivos.map((a) => [a.nome, a.projetos, a.presencas])
                                )
                            )
                        }
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                    {data.alunosMaisAtivos.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Nenhum aluno com atividade registrada.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                                    <th className="py-2">Aluno</th>
                                    <th className="py-2">Projetos</th>
                                    <th className="py-2">Presenças</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.alunosMaisAtivos.map((aluno) => (
                                    <tr key={aluno.nome}>
                                        <td className="py-3 font-medium text-gray-900">{aluno.nome}</td>
                                        <td className="py-3 text-gray-600">{aluno.projetos}</td>
                                        <td className="py-3 text-gray-600">{aluno.presencas}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <div className="fixed bottom-10 right-10 z-50">
                <Button
                    onClick={() => exportarTudo(data)}
                    className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold py-6 px-8 rounded-xl shadow-xl flex items-center gap-3 transition-transform hover:scale-105 border-none"
                >
                    <Download className="w-6 h-6" />
                    <span className="text-lg">Exportar Relatório Completo</span>
                </Button>
            </div>

            <div className="h-20" />
        </div>
    );
}
