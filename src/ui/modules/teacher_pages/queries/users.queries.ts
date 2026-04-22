import { useQuery } from "@tanstack/react-query";

// TODO: prestar atencao
async function fetchUsers(page: number, limit: number): Promise<ApiUser[]> {
    const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const body = await res.json();
    return body.data;
}

export const userKeys = {
    all: ["users"] as const,
    list: (page: number, limit: number) => [...userKeys.all, "list", { page, limit }] as const,
};

export function useUsersProfile(page = 1, limit = 100) {
    // ta errado ainda nao sei o pq porem fica de TODO
    // TODO: fix problems
    return useQuery<ApiUser[]>({
        queryKey: userKeys.list(page, limit),
        queryFn: () => fetchUsers(page, limit),
    });
}
