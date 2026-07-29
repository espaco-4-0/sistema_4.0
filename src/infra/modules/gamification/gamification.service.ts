import { prisma } from "@/src/infra/data/prisma";

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
        position: index + 1,
        userId: row.userId,
        fullName: row.user.fullName,
        avatarUrl: row.user.avatarUrl,
        xp: row.xp,
        points: row.points,
        level: row.level,
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

    const xp = record?.xp ?? 0;
    const level = record?.level ?? levelFromXp(xp);

    const position = record
        ? (await prisma.gamification.count({
              where: { user: { isActive: true }, xp: { gt: record.xp } },
          })) + 1
        : null;

    return {
        userId,
        xp,
        points: record?.points ?? 0,
        level,
        xpCurrentLevel: xpForLevel(level),
        xpNextLevel: xpForLevel(level + 1),
        position,
        badges: badges.map((userBadge) => ({
            id: userBadge.badge.id,
            name: userBadge.badge.name,
            description: userBadge.badge.description,
            iconUrl: userBadge.badge.iconUrl,
            points: userBadge.badge.points,
            earnedAt: userBadge.earnedAt,
        })),
    };
}

export async function listBadges() {
    return prisma.badge.findMany({
        orderBy: { points: "asc" },
        include: { _count: { select: { userBadges: true } } },
    });
}

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
