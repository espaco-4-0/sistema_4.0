import { Users } from "lucide-react";

export const stats = [
    {
		title: "Total de Usuários",
		value: "4",
		icon: Users,
		color: "bg-yellow-100",
		iconColor: "text-yellow-700"
	 },
    {
		title: "Estudantes",
		value: "1",
		icon: Users,
		color: "bg-blue-100",
		iconColor: "text-blue-700"
	},
    {
		title: "Monitores",
		value: "1",
		icon: Users,
		color: "bg-green-100",
		iconColor: "text-green-700"
	 },
    {
		title: "Professores",
		value: "1",
		icon: Users,
		color: "bg-purple-100",
		iconColor: "text-purple-700"
	 },
];

export const userData = [
    {
		name: "Karol",
		email: "karol@ifal.edu.br",
		type: "Estudante",
		status: "Ativo",
		date: "14/01/2024"
	 },
    {
        name: "Marina",
        email: "mitsune@ifal.edu.br",
        type: "Monitor",
        status: "Ativo",
        date: "19/01/2024",
    },
    {
        name: "Ernany Oliveira",
        email: "ernany.oliveira@ifal.edu.br",
        type: "Pesquisador",
        status: "Ativo",
        date: "31/01/2024",
    },
    {
		name: "Vinicius",
		email: "ana.costa@ifal.edu.br",
		type: "Professor",
		status: "Ativo",
		date: "09/01/2024"
	},
];

export const getTypeStyle = (type: string) => {
    const styles: Record<string, string> =
	{
        Estudante: "bg-yellow-50 text-yellow-700 border-yellow-100",
        Monitor: "bg-orange-50 text-orange-700 border-orange-100",
        Pesquisador: "bg-amber-50 text-amber-700 border-amber-100",
        Professor: "bg-red-50 text-red-700 border-red-100",
    };
    return styles[type] || "bg-gray-50 text-gray-700";
};

export const getStatusStyle = (status) => {
        switch (status) {
            case "Disponível": return "bg-green-100 text-green-700 border-green-200";
            case "Estoque Baixo": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Esgotado": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };
