"use client";

import { useMemo, useState } from "react";
import { AdminCourseItem, COURSE_RESOURCE_LABELS } from "@/src/infra/modules/professor/courses-admin.service";
import { CourseFormModal } from "@/src/ui/components/modals/professor/cursos/course-form-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/ui/components/ui/dropdown-menu";
import { Input } from "@/src/ui/components/ui/input";
import { useAdminCourses, useDeleteCourse, useUpdateCourse } from "@/src/ui/modules/teacher_pages/queries/courses.queries";
import {
    AlertCircle,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    Clock,
    Loader2,
    MoreVertical,
    Pencil,
    Plus,
    Power,
    Search,
    Trash,
    Users,
} from "lucide-react";
import { useSession } from "next-auth/react";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

function scheduleSummary(course: AdminCourseItem): string {
    if (course.CourseSchedule.length === 0) return "Sem agenda definida";

    return course.CourseSchedule.slice(0, 3)
        .map((slot) => `${WEEKDAY_SHORT[slot.dayOfWeek]} ${slot.startTime}–${slot.endTime}`)
        .join(" · ")
        .concat(course.CourseSchedule.length > 3 ? ` +${course.CourseSchedule.length - 3}` : "");
}

export default function Courses() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("todos");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminCourseItem | null>(null);

    const { data: courses = [], isLoading } = useAdminCourses();
    const updateMutation = useUpdateCourse();
    const deleteMutation = useDeleteCourse();

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesTerm =
                !term ||
                course.title.toLowerCase().includes(term) ||
                (course.professor?.fullName ?? "").toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === "todos" ||
                (statusFilter === "ativos" && course.isActive) ||
                (statusFilter === "inativos" && !course.isActive);

            return matchesTerm && matchesStatus;
        });
    }, [courses, search, statusFilter]);

    const stats = useMemo(
        () => ({
            total: courses.length,
            ativos: courses.filter((c) => c.isActive).length,
            matriculas: courses.reduce((sum, c) => sum + (c._count?.Enrollment ?? 0), 0),
            semAgenda: courses.filter((c) => c.CourseSchedule.length === 0).length,
        }),
        [courses]
    );

    if (status === "loading") return null;

    if (!session || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center mx-6 mt-6">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Acesso Restrito</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">
                    Apenas administradores e professores podem configurar cursos.
                </p>
            </div>
        );
    }

    function openCreate() {
        setEditing(null);
        setIsFormOpen(true);
    }

    function openEdit(course: AdminCourseItem) {
        setEditing(course);
        setIsFormOpen(true);
    }

    function toggleActive(course: AdminCourseItem) {
        updateMutation.mutate({ id: course.id, payload: { ativo: !course.isActive } });
    }

    function handleDelete(course: AdminCourseItem) {
        const vinculos = (course._count?.Lesson ?? 0) + (course._count?.Enrollment ?? 0);
        const aviso =
            vinculos > 0
                ? `"${course.title}" tem ${course._count?.Enrollment ?? 0} matrícula(s) e ${course._count?.Lesson ?? 0} aula(s). Excluir apaga esse histórico. Continuar?`
                : `Excluir "${course.title}"?`;

        if (!confirm(aviso)) return;

        deleteMutation.mutate({ id: course.id, force: vinculos > 0 });
    }

    const statCards = [
        { title: "Total de cursos", value: stats.total, icon: BookOpen, color: "bg-blue-50", iconColor: "text-blue-600" },
        { title: "Ativos", value: stats.ativos, icon: CheckCircle2, color: "bg-green-50", iconColor: "text-green-600" },
        { title: "Matrículas", value: stats.matriculas, icon: Users, color: "bg-yellow-50", iconColor: "text-yellow-600" },
        {
            title: "Sem agenda",
            value: stats.semAgenda,
            icon: CalendarClock,
            color: "bg-red-50",
            iconColor: "text-red-600",
        },
    ];

    return (
        <>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Configuração de Cursos</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Cadastre cursos, defina a agenda semanal e o acesso dos alunos matriculados.
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm font-medium"
                    >
                        <Plus size={18} /> Novo Curso
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100">
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

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-9 h-10"
                            placeholder="Buscar por curso ou professor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        {(["todos", "ativos", "inativos"] as const).map((option) => (
                            <button
                                key={option}
                                onClick={() => setStatusFilter(option)}
                                className={`px-4 h-10 rounded-lg text-sm font-medium capitalize transition ${
                                    statusFilter === option
                                        ? "bg-yellow-400 text-gray-900"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" /> Carregando cursos...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">Nenhum curso encontrado</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {courses.length === 0 ? "Cadastre o primeiro curso." : "Ajuste a busca ou os filtros."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Curso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Professor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Período
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Agenda
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Acessos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map((course) => {
                                        const liberados = course.CourseAccess.filter((a) => a.enabled);

                                        return (
                                            <tr key={course.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                                                        {course.workload ? (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {course.workload}h
                                                            </span>
                                                        ) : null}
                                                        <span className="inline-flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {course.capacity
                                                                ? `${course._count?.Enrollment ?? 0}/${course.capacity} vagas`
                                                                : `${course._count?.Enrollment ?? 0} inscritos`}
                                                        </span>
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {course.professor?.fullName ?? "—"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                    {formatDate(course.startDate)} → {formatDate(course.endDate)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {scheduleSummary(course)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {liberados.length === 0 ? (
                                                        <span className="text-xs text-gray-400">Nenhum</span>
                                                    ) : (
                                                        <span
                                                            className="text-xs text-gray-600"
                                                            title={liberados
                                                                .map((a) => COURSE_RESOURCE_LABELS[a.resource])
                                                                .join(", ")}
                                                        >
                                                            {liberados.length} recurso(s)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                            course.isActive
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : "bg-gray-100 text-gray-600 border-gray-200"
                                                        }`}
                                                    >
                                                        {course.isActive ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                aria-label={`Ações para ${course.title}`}
                                                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                                                            >
                                                                <MoreVertical className="h-4 w-4 text-gray-500" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEdit(course)}>
                                                                <Pencil className="h-4 w-4" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toggleActive(course)}>
                                                                <Power className="h-4 w-4" />
                                                                {course.isActive ? "Inativar" : "Ativar"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(course)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash className="h-4 w-4" /> Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <CourseFormModal
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                onClose={() => setIsFormOpen(false)}
                courseToEdit={editing}
            />
        </>
    );
}
