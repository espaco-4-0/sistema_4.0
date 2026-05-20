import { invalidateCacheNamespace } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { PresenceSituation } from "./presence-id.schema";

const PRESENCE_UPDATE_SELECT = {
    id: true,
    confirmed: true,
    confirmedAt: true,
    userId: true,
    lessonId: true,
} satisfies Prisma.PresenceSelect;

export type UpdatedPresence = Prisma.PresenceGetPayload<{ select: typeof PRESENCE_UPDATE_SELECT }>;

export async function findUserPresenceById(id: string, userId: string): Promise<boolean> {
    const current = await prisma.presence.findFirst({
        where: {
            id,
            userId,
        },
        select: {
            id: true,
        },
    });

    return !!current;
}

export function buildPresenceUpdateData(situation: PresenceSituation): Prisma.PresenceUpdateInput {
    const now = new Date();

    const dataBySituation = {
        pending: { confirmed: false, confirmedAt: null as Date | null },
        confirmed: { confirmed: true, confirmedAt: now },
        absent: { confirmed: false, confirmedAt: now },
    } as const;

    return dataBySituation[situation];
}

export async function updatePresenceById(id: string, data: Prisma.PresenceUpdateInput): Promise<UpdatedPresence> {
    const updated = await prisma.presence.update({
        where: { id },
        data,
        select: PRESENCE_UPDATE_SELECT,
    });

    await invalidateCacheNamespace("presences:me");

    return updated;
}
