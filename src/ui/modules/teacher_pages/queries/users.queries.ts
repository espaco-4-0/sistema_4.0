import { PublicUser } from "@/src/infra/modules/users/user.service";
import { useQuery } from "@tanstack/react-query";

async function fetchUsers(): Promise<PublicUser[]> {
    const res = await fetch(`/api/users?page=1&limit=1000`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const body = await res.json();
    return body.data;
}

export const userKeys = {
    all: ["users"] as const,
    list: () => [...userKeys.all, "list"] as const,
};

export function useUsersList() {
    return useQuery<PublicUser[]>({
        queryKey: userKeys.list(),
        queryFn: () => fetchUsers(),
    });
}
