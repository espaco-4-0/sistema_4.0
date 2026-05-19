import { invalidateCacheNamespace } from "@/lib/cache";
import { prisma } from "@/src/infra/data/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildPresenceUpdateData, findUserPresenceById, updatePresenceById } from "./presence-id.service";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        presence: {
            findFirst: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/cache", () => ({
    invalidateCacheNamespace: vi.fn(),
}));

describe("Presence Service", () => {
    const mockPresenceId = "presence-123";
    const mockUserId = "user-123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findUserPresenceById", () => {
        it("deve retornar TRUE se a presença for encontrada para o usuário", async () => {
            vi.mocked(prisma.presence.findFirst).mockResolvedValue({ id: mockPresenceId } as any);

            const result = await findUserPresenceById(mockPresenceId, mockUserId);

            expect(prisma.presence.findFirst).toHaveBeenCalledWith({
                where: {
                    id: mockPresenceId,
                    userId: mockUserId,
                },
                select: {
                    id: true,
                },
            });
            expect(result).toBe(true);
        });

        it(" retornar FALSE se a presença nso for encontrada", async () => {
            vi.mocked(prisma.presence.findFirst).mockResolvedValue(null);

            const result = await findUserPresenceById(mockPresenceId, mockUserId);

            expect(result).toBe(false);
        });
    });

    describe("buildPresenceUpdateData", () => {
        it("deve retornar os dados corretos para a situação 'pending'", () => {
            const result = buildPresenceUpdateData("pending");

            expect(result).toEqual({
                confirmed: false,
                confirmedAt: null,
            });
        });

        it(" retornar os dados corretos para a situaçso 'confirmed'", () => {
            const result = buildPresenceUpdateData("confirmed");

            expect(result).toEqual({
                confirmed: true,
                confirmedAt: expect.any(Date),
            });
        });

        it("deve retornar os dados corretos para a situação 'absent'", () => {
            const result = buildPresenceUpdateData("absent");

            expect(result).toEqual({
                confirmed: false,
                confirmedAt: expect.any(Date),
            });
        });
    });

    describe("updatePresenceById", () => {
        it("deve atualizar a presença, invalidar o cache correto e retornar os dados", async () => {
            const mockUpdateData = { confirmed: true, confirmedAt: new Date() };
            const mockUpdatedPresence = {
                id: mockPresenceId,
                confirmed: true,
                confirmedAt: mockUpdateData.confirmedAt,
                userId: mockUserId,
                lessonId: "aula-456",
            };

            vi.mocked(prisma.presence.update).mockResolvedValue(mockUpdatedPresence as any);

            const result = await updatePresenceById(mockPresenceId, mockUpdateData);

            expect(prisma.presence.update).toHaveBeenCalledWith({
                where: { id: mockPresenceId },
                data: mockUpdateData,
                select: expect.any(Object),
            });

            expect(invalidateCacheNamespace).toHaveBeenCalledTimes(1);
            expect(invalidateCacheNamespace).toHaveBeenCalledWith("presences:me");

            expect(result).toEqual(mockUpdatedPresence);
        });
    });
});
