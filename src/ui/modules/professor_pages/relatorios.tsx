import React from "react";
import {
    alunosMaisAtivos,
    avancosProjetos,
    estudantesPorCurso,
    mockDados,
    projetosPorMes,
    recorrenciaAlunos,
    statusProjetos,
    taxaConclusao,
} from "@/src/infra/modules/professor/relatiorios-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import { Download } from "lucide-react";
import {
    Area,
    AreaChart,
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

interface ChartCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export default function RelatoriosState() {
    const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
        <Card className="flex flex-col h-120 shadow-sm border-gray-100 overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">{subtitle}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400">
                    <Download className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-4">{children}</CardContent>
        </Card>
    );

    return (
        <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockDados.map((item: any) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between"
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
                <ChartCard title="Projetos por Mês" subtitle="Iniciados vs Concluídos">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projetosPorMes}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#666" }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666" }} />
                            <Tooltip cursor={{ fill: "#F9FAFB" }} />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="square"
                                wrapperStyle={{ paddingTop: 20 }}
                            />
                            <Bar
                                name="Concluídos"
                                dataKey="concluidos"
                                fill="#10B981"
                                radius={[2, 2, 0, 0]}
                                barSize={24}
                            />
                            <Bar
                                name="Iniciados"
                                dataKey="iniciados"
                                fill="#FBBF24"
                                radius={[2, 2, 0, 0]}
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Status dos Projetos" subtitle="Distribuição atual">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusProjetos}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={120}
                                dataKey="value"
                                stroke="none"
                            >
                                {statusProjetos.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Estudantes por Curso" subtitle="Distribuição por engenharia">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={estudantesPorCurso} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F0F0F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="curso" type="category" width={100} axisLine={false} tickLine={false} />
                            <Bar dataKey="total" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Taxa de Conclusão" subtitle="Evolução mensal (%)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={taxaConclusao}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} dy={10} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend verticalAlign="bottom" iconType="circle" />
                            <Line
                                name="Taxa (%)"
                                type="monotone"
                                dataKey="taxa"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 6, fill: "#10B981" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Recorrência de Alunos" subtitle="Evolução mensal">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recorrenciaAlunos}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} dy={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend verticalAlign="bottom" iconType="square" />
                            <Bar name="Ativos" dataKey="ativos" fill="#FBBF24" radius={[2, 2, 0, 0]} barSize={12} />
                            <Bar name="Novos" dataKey="novos" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={12} />
                            <Bar
                                name="Recorrentes"
                                dataKey="recorrentes"
                                fill="#10B981"
                                radius={[2, 2, 0, 0]}
                                barSize={12}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Avanços dos Projetos" subtitle="Evolução mensal (%)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={avancosProjetos}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} dy={10} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                            <Line
                                name="Percentual de Conclusão (%)"
                                type="monotone"
                                dataKey="percentualConclusao"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 6, fill: "#10B981" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Top 5 Alunos Mais Ativos" subtitle="Projetos e Horas Trabalhadas">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={alunosMaisAtivos}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                            <Bar
                                name="Horas Trabalhadas"
                                dataKey="horasTrabalhadas"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                                barSize={35}
                            />
                            <Bar name="Projetos" dataKey="projetos" fill="#FBBF24" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tarefas Concluídas vs Pendentes" subtitle="Evolução mensal">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={avancosProjetos}>
                            <defs>
                                <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorPend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} dy={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                            <Area
                                type="monotone"
                                name="Concluídas"
                                dataKey="tarefasConcluidas"
                                stroke="#10B981"
                                fillOpacity={1}
                                fill="url(#colorConc)"
                            />
                            <Area
                                type="monotone"
                                name="Pendentes"
                                dataKey="tarefasPendentes"
                                stroke="#EF4444"
                                fillOpacity={1}
                                fill="url(#colorPend)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="fixed bottom-10 right-10 z-50">
                <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold py-6 px-8 rounded-xl shadow-xl flex items-center gap-3 transition-transform hover:scale-105 border-none">
                    <Download className="w-6 h-6" />
                    <span className="text-lg">Exportar Relatório Completo</span>
                </Button>
            </div>

            <div className="h-20" />
        </div>
    );
}
