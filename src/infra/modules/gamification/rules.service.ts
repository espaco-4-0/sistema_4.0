import { BadgeCriteria, GamificationEvent } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/infra/data/prisma";

import { grantXp } from "./gamification.service";

export const GAMIFICATION_EVENTS = [
    "PRESENCE_CONFIRMED",
    "COURSE_ENROLLED",
    "COURSE_COMPLETED",
    "TASK_COMPLETED",
    "PROJECT_APPROVED",
    "BLOG_POST_PUBLISHED",
] as const satisfies readonly GamificationEvent[];

export const BADGE_CRITERIA = [
    "MANUAL",
    "XP_TOTAL",
    "PRESENCE_COUNT",
    "COURSE_COUNT",
    "PROJECT_COUNT",
    "TASK_COUNT",
] as const satisfies readonly BadgeCriteria[];

/**
 * Devolve as regras já com os eventos que ainda não foram configurados, para o
 * painel sempre listar a tabela completa.
 */
export async function listRules() {
    const salvas = await prisma.gamificationRule.findMany();
    const porEvento = new Map(salvas.map((regra) => [regra.event, regra]));

    return GAMIFICATION_EVENTS.map((event) => {
        const regra = porEvento.get(event);

        return {
            event,
            xp: regra?.xp ?? 0,
            points: regra?.points ?? 0,
            isActive: regra?.isActive ?? false,
        };
    });
}

export type RuleInput = { event: GamificationEvent; xp: number; points: number; isActive: boolean };

export async function saveRules(rules: RuleInput[]) {
    await prisma.$transaction(
        rules.map((rule) =>
            prisma.gamificationRule.upsert({
                where: { event: rule.event },
                create: rule,
                update: { xp: rule.xp, points: rule.points, isActive: rule.isActive },
            })
        )
    );

    return listRules();
}

/** Quantas vezes o usuário já cumpriu o critério de cada badge. */
async function countForCriteria(userId: string, criteria: BadgeCriteria): Promise<number> {
    switch (criteria) {
        case "XP_TOTAL": {
            const registro = await prisma.gamification.findUnique({ where: { userId }, select: { xp: true } });
            return registro?.xp ?? 0;
        }
        case "PRESENCE_COUNT":
            return prisma.presence.count({ where: { userId, confirmed: true } });
        case "COURSE_COUNT":
            return prisma.enrollment.count({ where: { userId, status: { not: "CANCELLED" } } });
        case "PROJECT_COUNT":
            return prisma.projectMember.count({ where: { userId } });
        case "TASK_COUNT":
            return prisma.task.count({ where: { assignedToId: userId, status: "DONE" } });
        default:
            return 0;
    }
}

/**
 * Concede as badges automáticas que o usuário passou a merecer. Badges MANUAL
 * ficam de fora — só a professora as atribui.
 */
export async function evaluateBadges(userId: string): Promise<string[]> {
    const candidatas = await prisma.badge.findMany({
        where: { isActive: true, criteria: { not: "MANUAL" }, criteriaValue: { not: null } },
    });

    if (candidatas.length === 0) return [];

    const jaTem = await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } });
    const conquistadas = new Set(jaTem.map((registro) => registro.badgeId));

    const pendentes = candidatas.filter((badge) => !conquistadas.has(badge.id));
    if (pendentes.length === 0) return [];

    // Uma consulta por critério distinto, não por badge.
    const criterios = [...new Set(pendentes.map((badge) => badge.criteria))];
    const contagens = new Map<BadgeCriteria, number>();

    await Promise.all(
        criterios.map(async (criterio) => {
            contagens.set(criterio, await countForCriteria(userId, criterio));
        })
    );

    const concedidas: string[] = [];

    for (const badge of pendentes) {
        const atual = contagens.get(badge.criteria) ?? 0;

        if (badge.criteriaValue !== null && atual >= badge.criteriaValue) {
            await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });

            if (badge.points > 0) {
                await grantXp(userId, 0, badge.points);
            }

            concedidas.push(badge.name);
        }
    }

    return concedidas;
}

export type AwardResult = {
    applied: boolean;
    xp: number;
    points: number;
    badges: string[];
};

/**
 * Ponto único de pontuação do sistema. Consulta quanto vale o evento segundo a
 * configuração da professora, credita e reavalia as badges.
 *
 * Nunca lança: gamificação não pode derrubar a ação principal (confirmar
 * presença, concluir tarefa) se algo der errado aqui.
 */
export async function awardForEvent(userId: string, event: GamificationEvent): Promise<AwardResult> {
    const vazio: AwardResult = { applied: false, xp: 0, points: 0, badges: [] };

    try {
        const regra = await prisma.gamificationRule.findUnique({ where: { event } });

        if (!regra || !regra.isActive || (regra.xp === 0 && regra.points === 0)) {
            // Mesmo sem regra ativa, badges por contagem podem ter sido atingidas.
            return { ...vazio, badges: await evaluateBadges(userId) };
        }

        await grantXp(userId, regra.xp, regra.points);
        const badges = await evaluateBadges(userId);

        return { applied: true, xp: regra.xp, points: regra.points, badges };
    } catch (error) {
        console.error(`[gamification] falha ao pontuar ${event} para ${userId}`, error);
        return vazio;
    }
}

export async function listBadgesAdmin() {
    return prisma.badge.findMany({
        orderBy: [{ isActive: "desc" }, { points: "asc" }],
        include: { _count: { select: { userBadges: true } } },
    });
}

export async function createBadge(data: {
    name: string;
    description?: string | null;
    points: number;
    criteria: BadgeCriteria;
    criteriaValue?: number | null;
    isActive?: boolean;
}) {
    return prisma.badge.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            points: data.points,
            criteria: data.criteria,
            criteriaValue: data.criteria === "MANUAL" ? null : (data.criteriaValue ?? null),
            isActive: data.isActive ?? true,
        },
    });
}

export async function updateBadge(
    id: string,
    data: Partial<{
        name: string;
        description: string | null;
        points: number;
        criteria: BadgeCriteria;
        criteriaValue: number | null;
        isActive: boolean;
    }>
) {
    return prisma.badge.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.points !== undefined && { points: data.points }),
            ...(data.criteria !== undefined && { criteria: data.criteria }),
            ...(data.criteriaValue !== undefined && { criteriaValue: data.criteriaValue }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
    });
}

export async function deleteBadge(id: string) {
    await prisma.badge.delete({ where: { id } });
}

/** Atribuição manual pela professora, para badges de critério MANUAL. */
export async function grantBadgeManually(userId: string, badgeId: string) {
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new Error("Badge não encontrada");

    const existente = await prisma.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId } } });
    if (existente) throw new Error("O aluno já possui esta badge");

    const criada = await prisma.userBadge.create({ data: { userId, badgeId } });

    if (badge.points > 0) {
        await grantXp(userId, 0, badge.points);
    }

    return criada;
}
