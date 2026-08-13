import {
    emitCertificate,
    getTemplates,
    type EmitCertificatePayload,
} from "@/src/infra/modules/professor/certificates.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ApiErrorPayload = { response?: { data?: { message?: string } } };

function apiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as ApiErrorPayload)?.response?.data?.message;
    return typeof message === "string" ? message : fallback;
}

export function useCertificateTemplates() {
    return useQuery({
        queryKey: ["certificates", "templates"],
        queryFn: getTemplates,
        staleTime: 60 * 1000,
    });
}

export function useEmitCertificate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: EmitCertificatePayload) => emitCertificate(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            toast.success("Certificado emitido.");
        },
        onError: (error) => toast.error(apiErrorMessage(error, "Erro ao emitir certificado.")),
    });
}
