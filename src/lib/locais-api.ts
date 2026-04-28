export interface Local {
    id: string;
    nome: string;
    descricao?: string | null;
    capacidade?: number | null;
    duracaoMin?: number | null;
    ativo?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

async function handleFetchResponse<T>(res: Response, defaultErrorMsg: string): Promise<T> {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || defaultErrorMsg);
    }
    const json = await res.json();
    return json.data as T;
}

export async function getLocais(includeInactive: boolean = false, q?: string): Promise<Local[]> {
    try {
        const params = new URLSearchParams();
        if (includeInactive) params.set("includeInactive", "true");
        if (q) params.set("q", q);

        const res = await fetch(`/api/locais?${params.toString()}`);
        if (!res.ok) return [];

        const json = await res.json();
        return (json?.data ?? []) as Local[];
    } catch {
        return [];
    }
}

// Omit para garantir que o programador não passe ID na criação
export async function createLocal(payload: Omit<Local, "id" | "createdAt" | "updatedAt">): Promise<Local> {
    const res = await fetch("/api/locais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleFetchResponse<Local>(res, "Erro ao criar local");
}

export async function updateLocal(
    id: string,
    payload: Partial<Omit<Local, "id" | "createdAt" | "updatedAt">>
): Promise<Local> {
    const body = { id, ...payload };
    const res = await fetch("/api/locais", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return handleFetchResponse<Local>(res, "Erro ao atualizar local");
}

export async function deleteLocal(id: string): Promise<void> {
    const res = await fetch(`/api/locais?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao remover local");
    }
}
