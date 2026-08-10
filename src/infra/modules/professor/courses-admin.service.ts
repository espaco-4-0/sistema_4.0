import api from "@/lib/axios";

export const COURSE_RESOURCE_LABELS: Record<string, string> = {
    LESSONS: "Aulas",
    PRESENCE: "Presença",
    CERTIFICATES: "Certificados",
    GALLERY: "Galeria",
    BLOG: "Blog",
    PROJECTS: "Projetos",
    INVENTORY: "Inventário",
    GAMIFICATION: "Gamificação",
};

export const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export interface CourseScheduleSlot {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    locationId?: string | null;
    location?: { id: string; name: string } | null;
}

export interface CourseAccessEntry {
    resource: string;
    enabled: boolean;
}

export interface AdminCourseItem {
    id: string;
    title: string;
    description: string | null;
    workload: number | null;
    capacity: number | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    createdAt: string;
    professorId: string;
    professor: { id: string; fullName: string; email: string } | null;
    CourseSchedule: CourseScheduleSlot[];
    CourseAccess: CourseAccessEntry[];
    _count?: { Lesson?: number; Enrollment?: number };
}

/** Corpo aceito por POST /api/courses e PATCH /api/courses/:id */
export interface CoursePayload {
    titulo?: string;
    descricao?: string;
    cargaHoraria?: number;
    vagas?: number | null;
    dataInicio?: string | null;
    dataFim?: string | null;
    ativo?: boolean;
    professorId?: string;
    agenda?: { diaSemana: number; horaInicio: string; horaFim: string; localId?: string | null }[];
    acessos?: { recurso: string; liberado: boolean }[];
}

export interface CourseListParams {
    q?: string;
    ativo?: boolean;
    professorId?: string;
}

export interface LocationOption {
    id: string;
    nome: string;
}

export interface ProfessorOption {
    id: string;
    fullName: string;
    email: string;
}

export async function getAdminCourses(params: CourseListParams = {}): Promise<AdminCourseItem[]> {
    const { data } = await api.get("/api/courses", {
        params: {
            ...(params.q ? { q: params.q } : {}),
            ...(params.ativo !== undefined ? { ativo: String(params.ativo) } : {}),
            ...(params.professorId ? { professorId: params.professorId } : {}),
        },
    });
    return data.data ?? [];
}

export async function createAdminCourse(payload: CoursePayload): Promise<AdminCourseItem> {
    const { data } = await api.post("/api/courses", payload);
    return data;
}

export async function updateAdminCourse(id: string, payload: CoursePayload): Promise<AdminCourseItem> {
    const { data } = await api.patch(`/api/courses/${id}`, payload);
    return data;
}

export async function deleteAdminCourse(id: string, force = false): Promise<void> {
    await api.delete(`/api/courses/${id}`, { params: force ? { force: "true" } : {} });
}

export async function getLocationOptions(): Promise<LocationOption[]> {
    const { data } = await api.get("/api/locais");
    const list = Array.isArray(data) ? data : (data.data ?? []);
    return list.map((item: { id: string; nome?: string; name?: string }) => ({
        id: item.id,
        nome: item.nome ?? item.name ?? "Sem nome",
    }));
}

export async function getProfessorOptions(): Promise<ProfessorOption[]> {
    const [professores, admins] = await Promise.all([
        api.get("/api/users", { params: { role: "PROFESSOR", limit: 100, active: "true" } }),
        api.get("/api/users", { params: { role: "ADMIN", limit: 100, active: "true" } }),
    ]);

    const merge = [...(professores.data.data ?? []), ...(admins.data.data ?? [])];

    return merge.map((user: { id: string; fullName: string; email: string }) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
    }));
}
