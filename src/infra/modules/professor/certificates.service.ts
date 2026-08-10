import api from "@/lib/axios";

export interface CertificateTemplateItem {
    id: string;
    title: string;
    type: string;
    layout: Record<string, unknown>;
    updatedAt: string;
    _count?: { emissoes?: number };
}

export interface EmitCertificatePayload {
    templateId: string;
    alunoId: string;
    curso: string;
    validadeAte?: string;
}

export async function getTemplates(): Promise<CertificateTemplateItem[]> {
    const { data } = await api.get("/api/certificates/templates");
    return Array.isArray(data) ? data : (data.data ?? []);
}

export async function emitCertificate(payload: EmitCertificatePayload) {
    const { data } = await api.post("/api/certificates/emit", payload);
    return data;
}
