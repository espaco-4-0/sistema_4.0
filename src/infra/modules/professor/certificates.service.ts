import api from "@/lib/axios";

export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
    PARTICIPATION: "Participação",
    COMPLETION: "Conclusão",
    EXCELLENCE: "Excelência",
};

export const ISSUANCE_STATUS_LABELS: Record<string, string> = {
    COMPLETED: "Emitido",
    IN_PROGRESS: "Em andamento",
    PENDING: "Pendente",
};

export const ISSUANCE_STATUS_STYLES: Record<string, string> = {
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export interface CertificateMetrics {
    totalGenerated: number;
    participationCount: number;
    completionCount: number;
    excellenceCount: number;
}

export interface CertificateTemplateItem {
    id: string;
    title: string;
    type: string;
    layout: Record<string, unknown>;
    updatedAt: string;
    _count?: { emissoes?: number };
}

export interface SignatureData {
    id: string;
    responsibleName: string;
    role: string;
    signatureImageUrl: string;
}

export interface IssuanceRow {
    id: string;
    studentId: string;
    studentName: string;
    courseName: string;
    status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
    templateId: string | null;
    issuedAt: string | null;
}

export interface IssuancesPage {
    data: IssuanceRow[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateTemplateInput {
    titulo: string;
    descricao?: string;
    tipo: string;
    cargaHoraria?: number;
    layout: Record<string, string>;
}

export async function getMetrics(): Promise<CertificateMetrics> {
    const { data } = await api.get("/api/certificates/metrics");
    return data;
}

export async function getTemplates(): Promise<CertificateTemplateItem[]> {
    const { data } = await api.get("/api/certificates/templates");
    return Array.isArray(data) ? data : (data.data ?? []);
}

export async function createTemplate(payload: CreateTemplateInput) {
    const { data } = await api.post("/api/certificates/templates", payload);
    return data;
}

export async function updateTemplate(id: string, payload: Partial<CreateTemplateInput>) {
    const { data } = await api.put(`/api/certificates/templates/${id}`, payload);
    return data;
}

/** 404 aqui significa "ainda não configurada", não erro. */
export async function getSignature(): Promise<SignatureData | null> {
    try {
        const { data } = await api.get("/api/certificates/signature");
        return data;
    } catch (error) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return null;
        throw error;
    }
}

export async function saveSignature(input: { responsibleName: string; role: string; file?: File }) {
    const formData = new FormData();
    formData.append("responsibleName", input.responsibleName);
    formData.append("role", input.role);
    if (input.file) formData.append("file", input.file);

    const { data } = await api.post("/api/certificates/signature", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export async function getIssuances(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<IssuancesPage> {
    const { data } = await api.get("/api/certificates/issuances", { params });
    return data;
}

export async function emitSingle(issuanceId: string, templateId: string) {
    const { data } = await api.post("/api/certificates/issuances/emit-single", { issuanceId, templateId });
    return data;
}

export async function emitBulk(issuanceIds: string[], templateId: string) {
    const { data } = await api.post("/api/certificates/issuances/emit-bulk", { issuanceIds, templateId });
    return data;
}

/** Sobe a imagem de fundo do template e devolve a URL pública. */
export async function uploadBackground(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/api/certificates/background", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
}
