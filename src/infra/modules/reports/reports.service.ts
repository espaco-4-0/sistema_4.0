import { prisma } from "@/src/infra/data/prisma";
import { startOfMonth, subMonths } from "date-fns";

import type { ReportsData } from "./reports.types";

const SERIES_MONTHS = 12;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planejado", color: "#A855F7" },
    IN_PROGRESS: { label: "Em Andamento", color: "#3B82F6" },
    COMPLETED: { label: "Concluído", color: "#22C55E" },
    CANCELLED: { label: "Cancelado", color: "#EF4444" },
};

function monthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Série de projetos iniciados vs. concluídos nos últimos 12 meses. */
async function buildProjetosPorMes() {
    const since = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1));

    const projetos = await prisma.project.findMany({
        where: { OR: [{ createdAt: { gte: since } }, { endDate: { gte: since } }] },
        select: { createdAt: true, endDate: true, status: true },
    });

    const buckets = new Map<string, { mes: string; iniciados: number; concluidos: number }>();

    for (let i = 0; i < SERIES_MONTHS; i++) {
        const date = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1 - i));
        buckets.set(monthKey(date), {
            mes: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
            iniciados: 0,
            concluidos: 0,
        });
    }

    projetos.forEach((projeto) => {
        const inicio = buckets.get(monthKey(projeto.createdAt));
        if (inicio) inicio.iniciados += 1;

        if (projeto.status === "COMPLETED" && projeto.endDate) {
            const fim = buckets.get(monthKey(projeto.endDate));
            if (fim) fim.concluidos += 1;
        }
    });

    return [...buckets.values()];
}

/** Alunos com mais projetos e presenças confirmadas. */
async function buildAlunosMaisAtivos() {
    const alunos = await prisma.user.findMany({
        where: { isActive: true, role: "VISITOR" },
        select: {
            fullName: true,
            _count: {
                select: {
                    ProjectMember: true,
                    Presence: true,
                },
            },
        },
    });

    return alunos
        .map((aluno) => ({
            nome: aluno.fullName,
            projetos: aluno._count.ProjectMember,
            presencas: aluno._count.Presence,
        }))
        .sort((a, b) => b.projetos - a.projetos || b.presencas - a.presencas)
        .slice(0, 5);
}

function emptyMonths<T extends object>(build: (mes: string) => T) {
    const buckets = new Map<string, T>();

    for (let i = 0; i < SERIES_MONTHS; i++) {
        const date = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1 - i));
        const mes = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
        buckets.set(monthKey(date), build(mes));
    }

    return buckets;
}

/** Presenças confirmadas e alunos distintos por mês — mede recorrência real. */
async function buildPresencaPorMes() {
    const since = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1));

    const presencas = await prisma.presence.findMany({
        where: { confirmed: true, confirmedAt: { gte: since } },
        select: { confirmedAt: true, userId: true },
    });

    const buckets = emptyMonths((mes) => ({ mes, alunos: 0, presencas: 0 }));
    const distintos = new Map<string, Set<string>>();

    presencas.forEach((presenca) => {
        if (!presenca.confirmedAt) return;

        const key = monthKey(presenca.confirmedAt);
        const bucket = buckets.get(key);
        if (!bucket) return;

        bucket.presencas += 1;
        const set = distintos.get(key) ?? new Set<string>();
        set.add(presenca.userId);
        distintos.set(key, set);
    });

    distintos.forEach((set, key) => {
        const bucket = buckets.get(key);
        if (bucket) bucket.alunos = set.size;
    });

    return [...buckets.values()];
}

/** Tarefas concluídas vs. ainda abertas, por mês de criação. */
async function buildTarefasPorMes() {
    const since = startOfMonth(subMonths(new Date(), SERIES_MONTHS - 1));

    const tarefas = await prisma.task.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true },
    });

    const buckets = emptyMonths((mes) => ({ mes, concluidas: 0, pendentes: 0 }));

    tarefas.forEach((tarefa) => {
        const bucket = buckets.get(monthKey(tarefa.createdAt));
        if (!bucket) return;

        if (tarefa.status === "DONE") bucket.concluidas += 1;
        else if (tarefa.status !== "CANCELLED") bucket.pendentes += 1;
    });

    return [...buckets.values()];
}

export async function getReports(): Promise<ReportsData> {
    const [
        projetosTotais,
        projetosConcluidos,
        estudantesAtivos,
        cursosAtivos,
        matriculas,
        porStatus,
        cursosComInscritos,
        projetosPorMes,
        alunosMaisAtivos,
    ] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: "COMPLETED" } }),
        prisma.user.count({ where: { isActive: true, role: "VISITOR" } }),
        prisma.course.count({ where: { isActive: true } }),
        prisma.enrollment.count(),
        prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.course.findMany({
            where: { isActive: true },
            select: { title: true, _count: { select: { Enrollment: true } } },
            orderBy: { title: "asc" },
        }),
        buildProjetosPorMes(),
        buildAlunosMaisAtivos(),
    ]);

    const [presencaPorMes, tarefas] = await Promise.all([buildPresencaPorMes(), buildTarefasPorMes()]);

    // Taxa acumulada mês a mês: concluídos / iniciados até ali.
    let acumIniciados = 0;
    let acumConcluidos = 0;
    const taxaConclusao = projetosPorMes.map((ponto) => {
        acumIniciados += ponto.iniciados;
        acumConcluidos += ponto.concluidos;
        return {
            mes: ponto.mes,
            taxa: acumIniciados === 0 ? 0 : Math.round((acumConcluidos / acumIniciados) * 100),
        };
    });

    return {
        resumo: {
            projetosTotais,
            projetosConcluidos,
            estudantesAtivos,
            taxaConclusaoPercent: projetosTotais === 0 ? 0 : Math.round((projetosConcluidos / projetosTotais) * 100),
            cursosAtivos,
            matriculas,
        },
        projetosPorMes,
        estudantesPorCurso: cursosComInscritos.map((curso) => ({
            curso: curso.title,
            total: curso._count.Enrollment,
        })),
        statusProjetos: porStatus.map((linha) => ({
            name: STATUS_LABELS[linha.status]?.label ?? linha.status,
            value: linha._count._all,
            color: STATUS_LABELS[linha.status]?.color ?? "#9CA3AF",
        })),
        alunosMaisAtivos,
        taxaConclusao,
        presencaPorMes,
        tarefas,
    };
}
