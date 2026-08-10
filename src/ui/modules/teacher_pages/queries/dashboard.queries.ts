import { getOverview } from "@/src/infra/modules/professor/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export function useOverview() {
    return useQuery({
        queryKey: ["dashboard", "overview"],
        queryFn: getOverview,
        staleTime: 60 * 1000,
    });
}
