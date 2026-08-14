import api from "@/lib/axios";

export interface StudentCertificate {
    id: string;
    title: string;
    type: string;
    hours: number | null;
    course: string;
    emittedAt: string;
    validUntil: string | null;
    totalDownloads: number;
}

export interface StudentCertificatesResponse {
    data: StudentCertificate[];
    summary: {
        achievedCertificates: number;
        hoursStudied: number;
        yearCertificates: number;
    };
}

export async function getMyCertificates(): Promise<StudentCertificatesResponse> {
    const { data } = await api.get("/api/certificates/me");
    return data;
}
