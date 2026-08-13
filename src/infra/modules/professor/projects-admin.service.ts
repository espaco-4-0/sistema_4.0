import api from "@/lib/axios";

export const PROJECT_STATUS_LABELS: Record<string, string> = {
    PLANNED: "Planejado",
    IN_PROGRESS: "Em Andamento",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
};

export const PROJECT_STATUS_STYLES: Record<string, string> = {
    PLANNED: "bg-purple-50 text-purple-700 border-purple-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovada",
    REJECTED: "Rejeitada",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
    TODO: "A fazer",
    IN_PROGRESS: "Em andamento",
    DONE: "Concluída",
    CANCELLED: "Cancelada",
};

type UserLite = { id: string; fullName: string; email?: string };

export interface ProjectItem {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    leaderId: string;
    leader: UserLite | null;
    ProjectMember: { id: string; role: string | null; user: UserLite }[];
    ProjectFile: { id: string; filename: string; url: string; mimeType: string; createdAt: string }[];
    request: { id: string; status: string } | null;
    _count?: { Task?: number; ProjectFile?: number; ProjectMember?: number };
}

export interface TaskItem {
    id: string;
    title: string;
    description: string | null;
    status: string;
    progress: number;
    dueDate: string | null;
    assignedToId: string | null;
    assignedTo: UserLite | null;
}

export interface ProjectRequestItem {
    id: string;
    title: string;
    description: string;
    objective: string;
    category: string;
    status: string;
    rejectionReason: string | null;
    reviewNotes: string | null;
    reviewedAt: string | null;
    createdAt: string;
    createdBy: UserLite | null;
    reviewedBy: UserLite | null;
    members: { id: string; role: string | null; user: UserLite }[];
    project: { id: string; title: string; status: string } | null;
}

export async function getProjects(params: { status?: string; search?: string } = {}): Promise<ProjectItem[]> {
    const { data } = await api.get("/api/projects", { params });
    return data.data ?? [];
}

export async function getProject(id: string): Promise<ProjectItem> {
    const { data } = await api.get(`/api/projects/${id}`);
    return data;
}

export async function updateProject(id: string, payload: Record<string, unknown>): Promise<ProjectItem> {
    const { data } = await api.patch(`/api/projects/${id}`, payload);
    return data;
}

export async function getProjectRequests(status?: string): Promise<ProjectRequestItem[]> {
    const { data } = await api.get("/api/project-requests", { params: status ? { status } : {} });
    return data.data ?? [];
}

export async function approveRequest(id: string, comment?: string) {
    const { data } = await api.patch(`/api/project-requests/${id}/approve`, comment ? { comment } : {});
    return data;
}

export async function rejectRequest(id: string, reason: string, observacoes?: string) {
    const { data } = await api.patch(`/api/project-requests/${id}/reject`, { reason, ...(observacoes ? { observacoes } : {}) });
    return data;
}

export async function getTasks(projectId: string): Promise<TaskItem[]> {
    const { data } = await api.get(`/api/projects/${projectId}/tasks`);
    return data.data ?? [];
}

export async function createTask(projectId: string, payload: Record<string, unknown>): Promise<TaskItem> {
    const { data } = await api.post(`/api/projects/${projectId}/tasks`, payload);
    return data;
}

export async function updateTaskStatus(taskId: string, status: string): Promise<TaskItem> {
    const { data } = await api.patch(`/api/tasks/${taskId}/status`, { status });
    return data;
}

export async function deleteTask(taskId: string): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
}

export async function uploadProjectFile(projectId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post(`/api/projects/${projectId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export async function deleteProjectFile(fileId: string): Promise<void> {
    await api.delete(`/api/files/${fileId}`);
}

export function fileDownloadUrl(fileId: string): string {
    return `/api/files/${fileId}`;
}
