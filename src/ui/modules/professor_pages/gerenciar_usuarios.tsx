import { getTypeStyle, stats, userData } from "@/src/infra/modules/professor/manage-users-mock";
import { Filter, MoreVertical, Search, Upload, UserPlus } from "lucide-react";

export default function GerenciarUsuarios() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Visão Geral</h2>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm font-medium">
                        <Upload size={18} /> Importar CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm font-medium">
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
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
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

                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-10 ">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 border-b  border-gray-100">
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
                            {userData.map((user) => (
                                <tr key={user.name} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
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
            </div>
    );
}
