import api from "@/lib/axios";

export interface MetricWithTrend {
    total: number;
    newThisMonth: number;
    newLastMonth: number;
    changePercent: number | null;
}

export interface OverviewAlert {
    id: string;
    title: string;
    count: number;
    href: string;
}

export interface OverviewSeriesPoint {
    month: string;
    Estudantes: number;
    Projetos: number;
}

export interface OverviewData {
    metrics: {
        students: MetricWithTrend;
        activeProjects: MetricWithTrend;
        attendanceRate: { percent: number; confirmed: number; total: number };
        pending: { total: number };
    };
    series: OverviewSeriesPoint[];
    alerts: OverviewAlert[];
}

export async function getOverview(): Promise<OverviewData> {
    const { data } = await api.get("/api/dashboard/overview");
    return data.data;
}
