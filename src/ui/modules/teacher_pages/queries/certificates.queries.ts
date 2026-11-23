import {
    createTemplate,
    emitBulk,
    emitSingle,
    getIssuances,
    getMetrics,
    getSignature,
    getTemplates,
    saveSignature,
    updateTemplate,
    type CreateTemplateInput,
} from "@/src/infra/modules/professor/certificates.service";
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

export const certificateKeys = {
    all: ["certificates"] as const,
    metrics: () => [...certificateKeys.all, "metrics"] as const,
    templates: () => [...certificateKeys.all, "templates"] as const,
    signature: () => [...certificateKeys.all, "signature"] as const,
    issuances: (params: Record<string, unknown>) => [...certificateKeys.all, "issuances", params] as const,
};

export function useCertificateMetrics() {
    return useQuery({ queryKey: certificateKeys.metrics(), queryFn: getMetrics, staleTime: 30 * 1000 });
}

export function useCertificateTemplates() {
    return useQuery({ queryKey: certificateKeys.templates(), queryFn: getTemplates, staleTime: 60 * 1000 });
}

export function useSignature() {
    return useQuery({ queryKey: certificateKeys.signature(), queryFn: getSignature, staleTime: 5 * 60 * 1000 });
}

export function useIssuances(params: { page: number; limit: number; search?: string; status?: string }) {
    return useQuery({
        queryKey: certificateKeys.issuances(params),
        queryFn: () => getIssuances(params),
        staleTime: 30 * 1000,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTemplateInput) => createTemplate(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: certificateKeys.all });
            toast.success("Template criado.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao criar template.")),
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTemplateInput> }) =>
            updateTemplate(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: certificateKeys.all });
            toast.success("Template atualizado.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao atualizar template.")),
    });
}

export function useSaveSignature() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveSignature,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: certificateKeys.signature() });
            toast.success("Assinatura salva.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao salvar assinatura.")),
    });
}

export function useEmitSingle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ issuanceId, templateId }: { issuanceId: string; templateId: string }) =>
            emitSingle(issuanceId, templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: certificateKeys.all });
            toast.success("Certificado emitido.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao emitir certificado.")),
    });
}

export function useEmitBulk() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ issuanceIds, templateId }: { issuanceIds: string[]; templateId: string }) =>
            emitBulk(issuanceIds, templateId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: certificateKeys.all });
            const total = (data?.resultados ?? []).reduce(
                (sum: number, r: { sucessos?: number }) => sum + (r.sucessos ?? 0),
                0
            );
            toast.success(`${total} certificado(s) emitido(s).`);
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao emitir em lote.")),
    });
}
