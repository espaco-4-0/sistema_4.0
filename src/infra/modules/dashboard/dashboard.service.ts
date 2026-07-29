import { prisma } from "@/src/infra/data/prisma";
import { subMonths, startOfMonth } from "date-fns";

const SERIES_MONTHS = 6;

export type OverviewMetrics = {
    students: { total: number; changePercent: number | null };
    activeProjects: { total: number; changePercent: number | null };
    completionRate: { percent: number };
    pending: { total: number };
};

function percentChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * Métricas reais da visão geral do painel. Substitui os números fixos que a tela
 * exibia ("127 estudantes", "+12%").
 */
export async function getOverviewMetrics(): Promise<OverviewMetrics> {
    const monthAgo = startOfMonth(subMonths(new Date(), 1));

    const [students, studentsLastMonth, activeProjects, projectsLastMonth, totalEnrollments, doneEnrollments, pendingRequests, pendingVisits] =
        await Promise.all([
            prisma.user.count({ where: { isActive: true, role: "VISITOR" } }),
            prisma.user.count({ where: { isActive: true, role: "VISITOR", createdAt: { lt: monthAgo } } }),
            prisma.project.count({ where: { status: "IN_PROGRESS" } }),
            prisma.project.count({ where: { status: "IN_PROGRESS", createdAt: { lt: monthAgo } } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { status: "CONFIRMED" } }),
            prisma.projectRequest.count({ where: { status: "PENDING" } }),
            prisma.visit.count({ where: { status: "PENDING" } }),
        ]);

    return {
        students: { total: students, changePercent: percentChange(students, studentsLastMonth) },
        activeProjects: { total: activeProjects, changePercent: percentChange(activeProjects, projectsLastMonth) },
        completionRate: {
            percent: totalEnrollments === 0 ? 0 : Math.round((doneEnrollments / totalEnrollments) * 100),
        },
        pending: { total: pendingRequests + pendingVisits },
    };
}

/** Série mensal de estudantes e projetos criados, para o gráfico da visão geral. */
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

/** Pendências que exigem ação do professor/admin, no lugar dos alertas fixos. */
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
