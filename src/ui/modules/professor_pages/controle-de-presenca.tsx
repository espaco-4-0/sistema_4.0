import { useEffect, useMemo, useState } from "react";
import {
    AttendanceTableProps,
    MOCK_STUDENTS,
    Student,
    Valores,
} from "@/src/infra/modules/professor/controle-presenca-mock";
import { Check, ChevronLeft, ChevronRight, Clock, Filter, Search, X } from "lucide-react";

export function AttendanceTable({ selectedDate, selectedClass, searchTerm }: Readonly<AttendanceTableProps>) {
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statsCalculated = useMemo(() => {
        return {
            total: students.length,
            present: students.filter((s) => s.status === "present").length,
            absent: students.filter((s) => s.status === "absent").length,
            late: students.filter((s) => s.status === "late").length,
        };
    }, [students]);

    const statValues = [statsCalculated.total, statsCalculated.present, statsCalculated.absent, statsCalculated.late];

    const filteredStudents = useMemo(() => {
        const safeSearch = (searchTerm || "").toLowerCase();
        return students.filter((student) => {
            const matchesSearch = student.name.toLowerCase().includes(safeSearch);
            const matchesClass = !selectedClass || selectedClass === "all" || student.class === selectedClass;
            return matchesSearch && matchesClass;
        });
    }, [students, searchTerm, selectedClass]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedClass]);

    const updateStatus = (id: string, status: "present" | "absent" | "late") => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.id === id) {
                    const now = new Date();
                    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                    return {
                        ...student,
                        status,
                        checkInTime: status === "absent" ? undefined : student.checkInTime || time,
                    };
                }
                return student;
            })
        );
    };

    return (
        <div className="flex flex-col gap-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Valores.map((item, index) => {
                    const Icon = item.icon;
                    const value = statValues[index] ?? 0;

                    return (
                        <div
                            key={item.title}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                                </div>
                                <div className={`${item.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${item.bgIconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar estudantes..."
                        value={searchTerm}
                        readOnly
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    <Filter size={18} /> Filtros
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estudante
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Turma
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Horário
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black text-xs font-semibold flex items-center justify-center">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{student.class}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                {
                                                    present: "bg-green-50 text-green-700 border-green-100",
                                                    absent: "bg-red-50 text-red-700 border-red-100",
                                                    late: "bg-yellow-50 text-yellow-700 border-yellow-100",
                                                    pending: "bg-gray-50 text-gray-600 border-gray-100",
                                                }[student.status] ?? "bg-gray-50 text-gray-600 border-gray-100"
                                            }`}
                                        >
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                        {student.checkInTime || "--:--"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(student.id, "present")}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(student.id, "late")}
                                                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                            >
                                                <Clock size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(student.id, "absent")}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                    <p className="text-sm text-gray-600">
                        Mostrando{" "}
                        <span className="font-medium">{filteredStudents.length > 0 ? startIndex + 1 : 0}</span> a{" "}
                        <span className="font-medium">
                            {Math.min(startIndex + itemsPerPage, filteredStudents.length)}
                        </span>{" "}
                        de <span className="font-medium">{filteredStudents.length}</span> alunos
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                            Página {currentPage} de {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
