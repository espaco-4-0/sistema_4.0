import { prisma } from "@/src/infra/data/prisma";
import { startOfMonth, subMonths } from "date-fns";

const SERIES_MONTHS = 6;

export type MetricWithTrend = {
    total: number;
    newThisMonth: number;
    newLastMonth: number;
    changePercent: number | null;
};

export type OverviewMetrics = {
    students: MetricWithTrend;
    activeProjects: MetricWithTrend;
    attendanceRate: { percent: number; confirmed: number; total: number };
    pending: { total: number };
};

function percentChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
    const thisMonthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

    const studentWhere = { isActive: true, role: "VISITOR" } as const;

    const [
        students,
        studentsThisMonth,
        studentsLastMonth,
        activeProjects,
        projectsThisMonth,
        projectsLastMonth,
        totalPresences,
        confirmedPresences,
        pendingRequests,
        pendingVisits,
    ] = await Promise.all([
        prisma.user.count({ where: studentWhere }),
        prisma.user.count({ where: { ...studentWhere, createdAt: { gte: thisMonthStart } } }),
        prisma.user.count({ where: { ...studentWhere, createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
        prisma.project.count({ where: { status: "IN_PROGRESS" } }),
        prisma.project.count({ where: { createdAt: { gte: thisMonthStart } } }),
        prisma.project.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
        prisma.presence.count(),
        prisma.presence.count({ where: { confirmed: true } }),
        prisma.projectRequest.count({ where: { status: "PENDING" } }),
        prisma.visit.count({ where: { status: "PENDING" } }),
    ]);

    return {
        students: {
            total: students,
            newThisMonth: studentsThisMonth,
            newLastMonth: studentsLastMonth,
            changePercent: percentChange(studentsThisMonth, studentsLastMonth),
        },
        activeProjects: {
            total: activeProjects,
            newThisMonth: projectsThisMonth,
            newLastMonth: projectsLastMonth,
            changePercent: percentChange(projectsThisMonth, projectsLastMonth),
        },
        attendanceRate: {
            percent: totalPresences === 0 ? 0 : Math.round((confirmedPresences / totalPresences) * 100),
            confirmed: confirmedPresences,
            total: totalPresences,
        },
        pending: { total: pendingRequests + pendingVisits },
    };
}

export async function getOverviewSeries() {
    const since = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1));

    const [users, projects] = await Promise.all([
        prisma.user.findMany({
            where: { role: "VISITOR", createdAt: { gte: since } },
            select: { createdAt: true },
        }),
        prisma.project.findMany({
            where: { createdAt: { gte: since } },
            select: { createdAt: true },
        }),
    ]);

    const buckets = new Map<string, { month: string; Estudantes: number; Projetos: number }>();

    for (let i = 0; i < SERIES_MONTHS; i++) {
        const date = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1 - i));
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        buckets.set(key, {
            month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date),
            Estudantes: 0,
            Projetos: 0,
        });
    }

    const bump = (date: Date, field: "Estudantes" | "Projetos") => {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const bucket = buckets.get(key);
        if (bucket) bucket[field] += 1;
    };

    users.forEach((user) => bump(user.createdAt, "Estudantes"));
    projects.forEach((project) => bump(project.createdAt, "Projetos"));

    return [...buckets.values()];
}

export async function getOverviewAlerts() {
    const [pendingRequests, pendingVisits, coursesWithoutLessons, outOfStock] = await Promise.all([
        prisma.projectRequest.count({ where: { status: "PENDING" } }),
        prisma.visit.count({ where: { status: "PENDING" } }),
        prisma.course.count({ where: { isActive: true, Lesson: { none: {} } } }),
        prisma.inventoryItem.count({ where: { isActive: true, quantity: 0 } }),
    ]);

    const alerts = [
        {
            id: "project-requests",
            title: "Solicitações de projeto aguardando análise",
            count: pendingRequests,
            href: "/professor/gerenciar-projetos",
        },
        { id: "visits", title: "Visitas aguardando aprovação", count: pendingVisits, href: "/professor/agenda" },
        {
            id: "courses-without-lessons",
            title: "Cursos ativos sem aulas cadastradas",
            count: coursesWithoutLessons,
            href: "/professor/visao-geral",
        },
        { id: "inventory", title: "Itens de inventário zerados", count: outOfStock, href: "/professor/recursos" },
    ];

    return alerts.filter((alert) => alert.count > 0);
}
