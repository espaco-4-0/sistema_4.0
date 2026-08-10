import api from "@/lib/axios";

export interface StudentOption {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
}

/** Alunos (VISITOR) para seletores de emissão de certificado e afins. */
export async function getStudentOptions(): Promise<StudentOption[]> {
    const { data } = await api.get("/api/users", { params: { role: "VISITOR", limit: 100 } });

    return (data.data ?? []).map((user: StudentOption) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
    }));
}
