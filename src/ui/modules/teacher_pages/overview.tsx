import { AlertCircle, Clock, FolderKanban, Package, TrendingUp, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const metricsData = [
    {
        title: "Total de Estudantes",
        value: "127",
        change: "+12%",
        trend: "up",
        subtitle: "Desde o último mês",
        icon: Users,
        color: "bg-blue-100",
        iconColor: "text-blue-700",
    },
    {
        title: "Projetos Ativos",
        value: "34",
        change: "+8%",
        trend: "up",
        subtitle: "Em desenvolvimento",
        icon: FolderKanban,
        color: "bg-yellow-100",
        iconColor: "text-yellow-700",
    },
    {
        title: "Taxa de Conclusão",
        value: "87%",
        change: "+5%",
        trend: "up",
        subtitle: "Últimos 3 meses",
        icon: TrendingUp,
        color: "bg-green-100",
        iconColor: "text-green-700",
    },
    {
        title: "Pendências",
        value: "7",
        change: "-2%",
        trend: "down",
        subtitle: "Requerem atenção",
        icon: AlertCircle,
        color: "bg-red-100",
        iconColor: "text-red-700",
    },
];

const chartData = [
    { month: "Jan", Estudantes: 78, Projetos: 42 },
    { month: "Fev", Estudantes: 98, Projetos: 45 },
    { month: "Mar", Estudantes: 110, Projetos: 48 },
    { month: "Abr", Estudantes: 102, Projetos: 58 },
    { month: "Mai", Estudantes: 140, Projetos: 52 },
    { month: "Jun", Estudantes: 142, Projetos: 88 },
];

const alerts = [
    {
        id: 1,
        title: "Projeto sem orientador",
        description: "Braço Robótico IoT precisa de orientação",
        time: "2h atrás",
        priority: "Urgente",
        priorityColor: "bg-red-100 text-red-700",
        icon: AlertCircle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
    },
    {
        id: 2,
        title: "Prazo próximo",
        description: "Sistema de Automação vence em 3 dias",
        time: "5h atrás",
        priority: "Aviso",
        priorityColor: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
    },
    {
        id: 3,
        title: "Material pendente",
        description: "Arduino Mega necessário para o projeto",
        time: "1 dia atrás",
        priority: "Aviso",
        priorityColor: "bg-yellow-100 text-yellow-700",
        icon: Package,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
    },
];

export function VisaoGeral() {
    const { data: session, status } = useSession();
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData.map((metric) => {
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
                        <BarChart data={chartData}>
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

                    <div className="space-y-4">
                        {alerts.map((alert) => {
                            const Icon = alert.icon;

                            return (
                                <div key={alert.id} className="border border-gray-100 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <div className={`${alert.iconBg} p-2 rounded-lg h-fit`}>
                                            <Icon className={`w-5 h-5 ${alert.iconColor}`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="font-medium text-sm">{alert.title}</h4>
                                                <span className={`text-xs px-2 py-1 rounded ${alert.priorityColor}`}>
                                                    {alert.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                                            <p className="text-xs text-gray-400">{alert.time}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
