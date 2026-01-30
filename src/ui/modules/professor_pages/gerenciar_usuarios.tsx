import { useState } from "react";
import { getTypeStyle, stats, userData } from "@/src/infra/modules/professor/manage-users-mock";
import { ImportCSVModal } from "@/src/ui/components/modals/professor/usuarios/import-csv-modal";
import { ChevronLeft, ChevronRight, Filter, MoreVertical, Search, Upload, UserPlus } from "lucide-react";

import NewUserModal from "../../components/modals/professor/usuarios/new-user-modal";

export default function GerenciarUsuarios() {
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(userData.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentUsers = userData.slice(startIndex, endIndex);

    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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

            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-gray-100 bg-white rounded-xl shadow-sm border ">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    <Filter size={18} /> Filtros
                </button>
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
                            {currentUsers.map((user, index) => (
                                <tr key={user.email + index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black text-xs font-semibold flex items-center justify-center">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeStyle(user.type)}`}
                                        >
                                            {user.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.date}</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                    <p className="text-sm text-gray-600">
                        Mostrando <span className="font-medium">{userData.length > 0 ? startIndex + 1 : 0}</span> a{" "}
                        <span className="font-medium">{Math.min(endIndex, userData.length)}</span> de{" "}
                        <span className="font-medium">{userData.length}</span> usuários
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
                onClose={() => setIsNewUserModalOpen(false)}
            />
            <ImportCSVModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} />
        </div>
    );
}
