import {
    CourseListParams,
    CoursePayload,
    createAdminCourse,
    deleteAdminCourse,
    getAdminCourses,
    getLocationOptions,
    getProfessorOptions,
    updateAdminCourse,
} from "@/src/infra/modules/professor/courses-admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiErrorPayload = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

/** A API devolve `message` e, em 422, `errors` por campo. */
export function apiErrorMessage(error: unknown, fallback: string): string {
    const payload = (error as ApiErrorPayload)?.response?.data;
    if (!payload) return fallback;

    if (payload.errors) {
        const first = Object.values(payload.errors).flat()[0];
        if (first) return first;
    }

    return payload.message || fallback;
}

export const courseKeys = {
    all: ["admin-courses"] as const,
    list: (filters?: CourseListParams) => [...courseKeys.all, "list", filters] as const,
};

export function useAdminCourses(params?: CourseListParams) {
    return useQuery({
        queryKey: courseKeys.list(params),
        queryFn: () => getAdminCourses(params ?? {}),
        staleTime: 60 * 1000,
    });
}

export function useLocationOptions() {
    return useQuery({
        queryKey: ["locations", "options"],
        queryFn: getLocationOptions,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProfessorOptions() {
    return useQuery({
        queryKey: ["professors", "options"],
        queryFn: getProfessorOptions,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdminCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
            toast.success("Curso criado com sucesso!");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao criar curso.")),
    });
}

export function useUpdateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CoursePayload }) => updateAdminCourse(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
            toast.success("Curso atualizado!");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao atualizar curso.")),
    });
}

export function useDeleteCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, force }: { id: string; force?: boolean }) => deleteAdminCourse(id, force),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
            toast.success("Curso excluído.");
        },
        // 409 = curso com aulas/matrículas. A mensagem da API já orienta a inativar.
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao excluir curso.")),
    });
}
