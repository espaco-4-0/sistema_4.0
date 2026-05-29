import api from "@/lib/axios";

export interface ResourceItem {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    quantity: number;
    unit?: string | null;
    location?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    responsibleId?: string | null;
    projectId?: string | null;
    responsible?: { id: string; fullName: string; email: string } | null;
    project?: { id: string; title: string } | null;
}

export interface GetResourcesParams {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
}

export interface ResourcesListResponse {
    data: ResourceItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: {
            total: number;
            available: number;
            lowStock: number;
            outOfStock: number;
        };
    };
}

export async function getResources(params: GetResourcesParams = {}): Promise<ResourcesListResponse> {
    const { data } = await api.get("/api/resources", { params });
    return data;
}

export async function createResource(data: Omit<ResourceItem, "id" | "createdAt" | "updatedAt" | "isActive">): Promise<ResourceItem> {
    const { data: response } = await api.post("/api/resources", data);
    return response;
}

export async function updateResource(id: string, data: Partial<ResourceItem>): Promise<ResourceItem> {
    const { data: response } = await api.patch(`/api/resources/${id}`, data);
    return response;
}

export async function deleteResource(id: string): Promise<void> {
    await api.delete(`/api/resources/${id}`);
}

export async function importResources(resources: any[]): Promise<{ imported: number; failed: number }> {
    const { data } = await api.post("/api/resources/import", { resources });
    return data;
}
