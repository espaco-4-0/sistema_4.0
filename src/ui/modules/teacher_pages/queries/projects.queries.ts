import {
    approveRequest,
    createTask,
    deleteProjectFile,
    deleteTask,
    getProjectRequests,
    getProjects,
    getTasks,
    rejectRequest,
    updateProject,
    updateTaskStatus,
    uploadProjectFile,
} from "@/src/infra/modules/professor/projects-admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiErrorPayload = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

function apiErrorMessage(error: unknown, fallback: string): string {
    const payload = (error as ApiErrorPayload)?.response?.data;
    if (!payload) return fallback;

    if (payload.errors) {
        const first = Object.values(payload.errors).flat()[0];
        if (first) return first;
    }

    return payload.message || fallback;
}

export const projectKeys = {
    all: ["projects"] as const,
    list: (filters?: { status?: string; search?: string }) => [...projectKeys.all, "list", filters] as const,
    tasks: (projectId: string) => [...projectKeys.all, projectId, "tasks"] as const,
    requests: (status?: string) => ["project-requests", status ?? "all"] as const,
};

export function useProjects(filters?: { status?: string; search?: string }) {
    return useQuery({
        queryKey: projectKeys.list(filters),
        queryFn: () => getProjects(filters ?? {}),
        staleTime: 60 * 1000,
    });
}

export function useProjectRequests(status?: string) {
    return useQuery({
        queryKey: projectKeys.requests(status),
        queryFn: () => getProjectRequests(status),
        staleTime: 30 * 1000,
    });
}

export function useProjectTasks(projectId: string | null) {
    return useQuery({
        queryKey: projectKeys.tasks(projectId ?? ""),
        queryFn: () => getTasks(projectId as string),
        enabled: Boolean(projectId),
    });
}

/** Aprovar cria o projeto: invalida projetos e solicitações. */
export function useApproveRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) => approveRequest(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-requests"] });
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Solicitação aprovada. Projeto criado.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao aprovar solicitação.")),
    });
}

export function useRejectRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason, observacoes }: { id: string; reason: string; observacoes?: string }) =>
            rejectRequest(id, reason, observacoes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-requests"] });
            toast.success("Solicitação rejeitada.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao rejeitar solicitação.")),
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateProject(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Projeto atualizado.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao atualizar projeto.")),
    });
}

export function useCreateTask(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => createTask(projectId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Tarefa criada.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao criar tarefa.")),
    });
}

export function useUpdateTaskStatus(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: string }) => updateTaskStatus(taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao mudar o status.")),
    });
}

export function useDeleteTask(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) => deleteTask(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Tarefa excluída.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao excluir tarefa.")),
    });
}

export function useUploadProjectFile(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => uploadProjectFile(projectId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Arquivo anexado.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao anexar arquivo.")),
    });
}

export function useDeleteProjectFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (fileId: string) => deleteProjectFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            toast.success("Arquivo removido.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao remover arquivo.")),
    });
}
