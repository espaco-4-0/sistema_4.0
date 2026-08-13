import { getReportsData } from "@/src/infra/modules/professor/reports.service";
import { useQuery } from "@tanstack/react-query";

export function useReports() {
    return useQuery({
        queryKey: ["reports"],
        queryFn: getReportsData,
        staleTime: 60 * 1000,
    });
}
