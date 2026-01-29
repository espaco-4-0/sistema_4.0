import { Clock, FolderKanban, Medal, Users } from "lucide-react";

export const mockDados = [
    {
        title: "Projetos Totais (ano)",
        value: "68",
        icon: FolderKanban,
        color: "bg-blue-100",
        iconColor: "text-blue-700",
    },
    {
        title: "Taxa de sucesso",
        value: "87%",
        icon: Medal,
        color: "bg-green-100",
        iconColor: "text-green-700",
    },
    {
        title: "Usuários Ativos",
        value: "1.240",
        icon: Users,
        color: "bg-purple-100",
        iconColor: "text-purple-700",
    },
    {
        title: "Dias médios / Projeto",
        value: "45",
        icon: Clock,
        color: "bg-red-100",
        iconColor: "text-red-700",
    },
];

export const projetosPorMes = [
    {
		mes: "Ago",
		iniciados: 8,
		concluidos: 5
	},
    {
		mes: "Set",
		iniciados: 12,
		concluidos: 7
	},
    {
		mes: "Out",
		iniciados: 10,
		concluidos: 9
	},
    {
		mes: "Nov",
		iniciados: 15,
		concluidos: 11
	},
    {
		mes: "Dez",
		iniciados: 9,
		concluidos: 8
	},
    {
		mes: "Jan",
		iniciados: 14,
		concluidos: 10
	},
];

export const estudantesPorCurso = [
    {
        curso: "IOT",
        total: 35,
    },
    {
        curso: "TI",
        total: 28,
    },
    {
        curso: "SI",
        total: 22,
    },
    {
        curso: "Energia renovaveis",
        total: 18,
    },
    {
        curso: "Eletrica",
        total: 15,
    },
    {
        curso: "Drones",
        total: 9,
    },
];

export const statusProjetos = [
    {
        name: "Em Andamento",
        value: 45,
        color: "#3B82F6",
    },
    {
        name: "Concluídos",
        value: 30,
        color: "#10B981",
    },
    {
        name: "Atrasados",
        value: 15,
        color: "#EF4444",
    },
    {
        name: "Pendentes",
        value: 10,
        color: "#F59E0B",
    },
];

export const taxaConclusao = [
    { mes: "Ago", taxa: 78 },
    { mes: "Set", taxa: 82 },
    { mes: "Out", taxa: 85 },
    { mes: "Nov", taxa: 83 },
    { mes: "Dez", taxa: 88 },
    { mes: "Jan", taxa: 87 },
];

export const recorrenciaAlunos = [
    {
		mes: "Ago",
		ativos: 98,
		novos: 15,
		recorrentes: 83
	},
    {
		mes: "Set",
		ativos: 112,
		novos: 22,
		recorrentes: 90
	},
    {
		mes: "Out",
		ativos: 107,
		novos: 18,
		recorrentes: 89
	},
    {
		mes: "Nov",
		ativos: 125,
		novos: 28,
		recorrentes: 97
	 },
    {
		mes: "Dez",
		ativos: 103,
		novos: 12,
		recorrentes: 91
	},
    { mes: "Jan", ativos: 127, novos: 20, recorrentes: 107 },
];

export const avancosProjetos = [
    { mes: "Ago", tarefasConcluidas: 142, tarefasPendentes: 58, percentualConclusao: 71 },
    { mes: "Set", tarefasConcluidas: 168, tarefasPendentes: 52, percentualConclusao: 76 },
    { mes: "Out", tarefasConcluidas: 185, tarefasPendentes: 45, percentualConclusao: 80 },
    { mes: "Nov", tarefasConcluidas: 201, tarefasPendentes: 49, percentualConclusao: 80 },
    { mes: "Dez", tarefasConcluidas: 178, tarefasPendentes: 41, percentualConclusao: 81 },
    { mes: "Jan", tarefasConcluidas: 195, tarefasPendentes: 38, percentualConclusao: 84 },
];

export const alunosMaisAtivos = [
    { nome: "Lucas Silva", projetos: 8, horasTrabalhadas: 156 },
    { nome: "Maria Santos", projetos: 7, horasTrabalhadas: 142 },
    { nome: "Pedro Oliveira", projetos: 6, horasTrabalhadas: 138 },
    { nome: "Ana Costa", projetos: 6, horasTrabalhadas: 125 },
    { nome: "João Ferreira", projetos: 5, horasTrabalhadas: 118 },
];
