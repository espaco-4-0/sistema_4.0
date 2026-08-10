import api from "@/lib/axios";
import type { ReportsData } from "@/src/infra/modules/reports/reports.types";

export type { ReportsData };

export async function getReportsData(): Promise<ReportsData> {
    const { data } = await api.get("/api/reports");
    return data.data;
}
