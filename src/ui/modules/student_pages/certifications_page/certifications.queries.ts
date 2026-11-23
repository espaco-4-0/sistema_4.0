import { getMyCertificates } from "@/src/infra/modules/student/certificates.service";
import { useQuery } from "@tanstack/react-query";

export function useMyCertificates() {
    return useQuery({
        queryKey: ["certificates", "me"],
        queryFn: getMyCertificates,
        staleTime: 60 * 1000,
    });
}
