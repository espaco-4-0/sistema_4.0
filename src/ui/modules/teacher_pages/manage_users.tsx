import { useEffect, useMemo, useState } from "react";
import { ImportCSVModal } from "@/src/ui/components/modals/professor/usuarios/import-csv-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/ui/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, MoreVertical, Search, Upload, UserPlus, Users } from "lucide-react";

import NewUserModal from "../../components/modals/professor/usuarios/new-user-modal";
import { useUsersProfile, userKeys } from "./queries/users.queries";

type UserRole = "ADMIN" | "PROFESSOR" | "MONITOR" | "PESQUISADOR" | "VISITANTE";

type ApiUser = {
    id: string;
    nomeCompleto: string;
    email: string;
    role: UserRole;
    ativo: boolean;
    createdAt: string;
};

const roleLabel: Record<UserRole, string> = {
    ADMIN: "Administrador",
    PROFESSOR: "Professor",
    MONITOR: "Monitor",
    PESQUISADOR: "Pesquisador",
    VISITANTE: "Visitante",
};

function getRoleStyle(role: UserRole): string {
    const styles: Record<UserRole, string> = {
        ADMIN: "bg-slate-100 text-slate-700 border-slate-200",
        PROFESSOR: "bg-red-50 text-red-700 border-red-100",
        MONITOR: "bg-orange-50 text-orange-700 border-orange-100",
        PESQUISADOR: "bg-amber-50 text-amber-700 border-amber-100",
        VISITANTE: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };
    return styles[role];
}

export default function ManageUsers() {
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    const { data: users = [], isLoading: isLoadingUsers } = useUsersProfile();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    function handleUserCreated() {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
    }

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchFilter = typeFilter === "Todos" || roleLabel[user.role] === typeFilter;
            const matchSearch =
                term.length === 0 ||
                user.nomeCompleto.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term);
            return matchFilter && matchSearch;
        });
    }, [users, typeFilter, searchTerm]);

    const stats = useMemo(
        () => [
            {
                title: "Total de Usuários",
                value: String(users.length),
                icon: Users,
                color: "bg-yellow-100",
                iconColor: "text-yellow-700",
            },
            {
                title: "Visitantes",
                value: String(users.filter((u) => u.role === "VISITANTE").length),
                icon: Users,
                color: "bg-blue-100",
                iconColor: "text-blue-700",
            },
            {
                title: "Monitores",
                value: String(users.filter((u) => u.role === "MONITOR").length),
                icon: Users,
                color: "bg-green-100",
                iconColor: "text-green-700",
            },
            {
                title: "Professores",
                value: String(users.filter((u) => u.role === "PROFESSOR").length),
                icon: Users,
                color: "bg-purple-100",
                iconColor: "text-purple-700",
            },
        ],
        [users]
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, searchTerm]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Visão Geral</h2>
                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition shadow-sm text-sm font-medium"
                        onClick={() => setIsCSVModalOpen(true)}
                    >
                        <Upload size={18} /> Importar CSV
                    </button>
                    <button
                        onClick={() => setIsNewUserModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition hover:cursor-pointer shadow-sm text-sm font-medium"
                    >
                        <UserPlus size={18} /> Novo Usuário
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-b-4 border-b-transparent hover:border-b-yellow-primary hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Barra de Busca e Filtro, PS: nao retire o comentario */}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-gray-100 bg-white rounded-xl shadow-sm border ">
                <div className="relative w-full max-md:max-w-none max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                            <Filter size={18} /> Filtros
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Tipo de usuário</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                            {["Todos", "Administrador", "Professor", "Monitor", "Pesquisador", "Visitante"].map(
                                (type) => (
                                    <DropdownMenuRadioItem key={type} value={type}>
                                        {type}
                                    </DropdownMenuRadioItem>
                                )
                            )}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    E-mail
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingUsers ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black text-xs font-semibold flex items-center justify-center">
                                                    {user.nomeCompleto.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.nomeCompleto}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyle(user.role)}`}
                                            >
                                                {roleLabel[user.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${user.ativo ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}
                                            >
                                                {user.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação prestar atencao nao retire o comentarios */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                    <p className="text-sm text-gray-600">
                        Mostrando <span className="font-medium">{filteredUsers.length > 0 ? startIndex + 1 : 0}</span> a{" "}
                        <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> de{" "}
                        <span className="font-medium">{filteredUsers.length}</span> usuários
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                            Página {currentPage} de {totalPages || 1}
                        </div>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <NewUserModal
                isOpen={isNewUserModalOpen}
                handleOpenChange={setIsNewUserModalOpen}
                onUserCreated={handleUserCreated}
                onClose={() => setIsNewUserModalOpen(false)}
            />
            <ImportCSVModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} />
        </div>
    );
}
