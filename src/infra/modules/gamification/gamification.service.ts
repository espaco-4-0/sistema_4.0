import { prisma } from "@/src/infra/data/prisma";

/** Progressão quadrática: nível N exige XP_PER_LEVEL * N^2 de XP acumulado. */
const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
    if (xp <= 0) return 1;
    return Math.floor(Math.sqrt(xp / XP_PER_LEVEL)) + 1;
}

export function xpForLevel(level: number): number {
    return XP_PER_LEVEL * (level - 1) ** 2;
}

export async function getLeaderboard(limit = 10) {
    const rows = await prisma.gamification.findMany({
        where: { user: { isActive: true } },
        orderBy: [{ xp: "desc" }, { updatedAt: "asc" }],
        take: limit,
        include: {
            user: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        },
    });

    return rows.map((row, index) => ({
        posicao: index + 1,
        userId: row.userId,
        nome: row.user.fullName,
        avatarUrl: row.user.avatarUrl,
        xp: row.xp,
        pontos: row.points,
        nivel: row.level,
    }));
}

export async function getUserGamification(userId: string) {
    const record = await prisma.gamification.findUnique({
        where: { userId },
        include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
    });

    const badges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: "desc" },
        include: { badge: true },
    });

    // Usuário sem registro ainda não pontuou; devolvemos o estado zerado em vez de 404
    // para a tela não precisar tratar dois formatos de resposta.
    const xp = record?.xp ?? 0;
    const level = record?.level ?? levelFromXp(xp);

    const posicao = record
        ? (await prisma.gamification.count({
              where: { user: { isActive: true }, xp: { gt: record.xp } },
          })) + 1
        : null;

    return {
        userId,
        xp,
        pontos: record?.points ?? 0,
        nivel: level,
        xpNivelAtual: xpForLevel(level),
        xpProximoNivel: xpForLevel(level + 1),
        posicao,
        badges: badges.map((userBadge) => ({
            id: userBadge.badge.id,
            nome: userBadge.badge.name,
            descricao: userBadge.badge.description,
            iconUrl: userBadge.badge.iconUrl,
            pontos: userBadge.badge.points,
            conquistadoEm: userBadge.earnedAt,
        })),
    };
}

export async function listBadges() {
    return prisma.badge.findMany({
        orderBy: { points: "asc" },
        include: { _count: { select: { userBadges: true } } },
    });
}

/** Credita XP e pontos, recalculando o nível. Cria o registro se ainda não existir. */
export async function grantXp(userId: string, xpDelta: number, pointsDelta = xpDelta) {
    const current = await prisma.gamification.findUnique({ where: { userId } });
    const xp = Math.max(0, (current?.xp ?? 0) + xpDelta);
    const points = Math.max(0, (current?.points ?? 0) + pointsDelta);

    return prisma.gamification.upsert({
        where: { userId },
        create: { userId, xp, points, level: levelFromXp(xp) },
        update: { xp, points, level: levelFromXp(xp) },
    });
}
