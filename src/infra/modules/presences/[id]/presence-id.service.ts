import { invalidateCacheNamespace } from "@/lib/cache";
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";

import { PresenceSituation } from "./presence-id.schema";

const PRESENCE_UPDATE_SELECT = {
    id: true,
    confirmada: true,
    confirmedAt: true,
    userId: true,
    aulaId: true,
} satisfies Prisma.PresencaSelect;

export type UpdatedPresence = Prisma.PresencaGetPayload<{ select: typeof PRESENCE_UPDATE_SELECT }>;

export async function findUserPresenceById(id: string, userId: string): Promise<boolean> {
    const current = await prisma.presenca.findFirst({
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

export function buildPresenceUpdateData(situation: PresenceSituation): Prisma.PresencaUpdateInput {
    const now = new Date();

    const dataBySituation = {
        pending: { confirmada: false, confirmedAt: null as Date | null },
        confirmed: { confirmada: true, confirmedAt: now },
        absent: { confirmada: false, confirmedAt: now },
    } as const;

    return dataBySituation[situation];
}

export async function updatePresenceById(id: string, data: Prisma.PresencaUpdateInput): Promise<UpdatedPresence> {
    const updated = await prisma.presenca.update({
        where: { id },
        data,
        select: PRESENCE_UPDATE_SELECT,
    });

    await invalidateCacheNamespace("presences:me");

    return updated;
}
