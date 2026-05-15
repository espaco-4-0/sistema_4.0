"use client";

import React, { useEffect, useState } from "react";
import { inventoryData, statsEstoque } from "@/src/infra/modules/professor/recursos-mock";
import { ImportarRecurso } from "@/src/ui/components/modals/professor/recursos/import-recurso-modal";
import { ImportarRecursosModal } from "@/src/ui/components/modals/professor/recursos/import-recursos-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/ui/components/ui/dropdown-menu";
import { AlertCircle, ChevronLeft, ChevronRight, Filter, MoreVertical, Plus, PlusCircle, Search } from "lucide-react";
import { useSession } from "next-auth/react";

function getStatusStyle(status: string) {
    switch (status) {
        case "Disponível":
            return "bg-green-100 text-green-700 border-green-200";
        case "Estoque Baixo":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "Esgotado":
            return "bg-red-100 text-red-700 border-red-200";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default function Resources() {
    const { data: session, status } = useSession();
    const [openImportar, setOpenImportar] = useState(false);
    const [openRecursos, setOpenRecursos] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");

    const itemsPerPage = 10;

    const filteredData = inventoryData.filter((item) => {
        const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

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
        <>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Visão Geral de Recursos</h2>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setOpenImportar(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg transition shadow-sm border hover:cursor-pointer hover:bg-gray-50 text-sm font-medium"
                        >
                            <Plus size={18} /> Adicionar Recurso
                        </button>

                        <button
                            onClick={() => setOpenRecursos(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 hover:cursor-pointer transition shadow-sm text-sm font-medium"
                        >
                            <PlusCircle size={18} /> Importar Recursos
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsEstoque.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="bg-white rounded-xl p-6 border border-gray-100 border-b-4 border-b-transparent transition-all duration-300 hover:border-gray-200 hover:border-b-yellow-primary"
                            >
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

                <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar recursos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none sm:text-sm"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                <Filter size={18} /> Filtros
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Status do recurso</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                {["Todos", "Disponível", "Estoque Baixo", "Esgotado"].map((status) => (
                                    <DropdownMenuRadioItem key={status} value={status}>
                                        {status}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {[
                                        "Nome",
                                        "Categoria",
                                        "Qtd Total",
                                        "Disponível",
                                        "Localização",
                                        "Status",
                                        "Ações",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase ${
                                                h === "Ações" ? "text-center" : ""
                                            }`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.categoria}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.total}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.disponivel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.localizacao}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-orange-400 hover:text-orange-600">
                                                <MoreVertical />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">
                            Mostrando{" "}
                            <span className="font-medium">{filteredData.length > 0 ? startIndex + 1 : 0}</span> a{" "}
                            <span className="font-medium">
                                {Math.min(startIndex + itemsPerPage, filteredData.length)}
                            </span>{" "}
                            de <span className="font-medium">{filteredData.length}</span> componentes
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="px-4 text-sm font-medium text-gray-700">
                                {currentPage} de {totalPages || 1}
                            </span>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ImportarRecursosModal open={openRecursos} onClose={() => setOpenRecursos(false)} />
            <ImportarRecurso open={openImportar} onClose={() => setOpenImportar(false)} />
        </>
    );
}
