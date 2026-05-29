import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    importResources,
    GetResourcesParams,
} from "@/src/infra/modules/professor/resources.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const resourceKeys = {
    all: ["resources"] as const,
    list: (filters?: GetResourcesParams) => [...resourceKeys.all, "list", filters] as const,
};

export function useResourcesList(params?: GetResourcesParams) {
    return useQuery({
        queryKey: resourceKeys.list(params),
        queryFn: () => getResources(params || {}),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useCreateResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.all });
            toast.success("Recurso adicionado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao adicionar recurso.");
        },
    });
}

export function useUpdateResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateResource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.all });
            toast.success("Recurso atualizado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao atualizar recurso.");
        },
    });
}

export function useDeleteResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.all });
            toast.success("Recurso removido com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao excluir recurso.");
        },
    });
}

export function useImportResources() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: importResources,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.all });
            toast.success(`Importação concluída! ${data.imported} recursos importados.`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao importar recursos.");
        },
    });
}
