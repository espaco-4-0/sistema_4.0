import { invalidateCacheNamespace } from "@/lib/cache";
import { prisma } from "@/src/ui/lib/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildPresenceUpdateData, findUserPresenceById, updatePresenceById } from "./presence-id.service";

vi.mock("@/src/ui/lib/prisma", () => ({
    prisma: {
        presenca: {
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
            vi.mocked(prisma.presenca.findFirst).mockResolvedValue({ id: mockPresenceId } as any);

            const result = await findUserPresenceById(mockPresenceId, mockUserId);

            expect(prisma.presenca.findFirst).toHaveBeenCalledWith({
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
            vi.mocked(prisma.presenca.findFirst).mockResolvedValue(null);

            const result = await findUserPresenceById(mockPresenceId, mockUserId);

            expect(result).toBe(false);
        });
    });

    describe("buildPresenceUpdateData", () => {
        it("deve retornar os dados corretos para a situação 'pending'", () => {
            const result = buildPresenceUpdateData("pending");

            expect(result).toEqual({
                confirmada: false,
                confirmedAt: null,
            });
        });

        it(" retornar os dados corretos para a situaçso 'confirmed'", () => {
            const result = buildPresenceUpdateData("confirmed");

            expect(result).toEqual({
                confirmada: true,
                confirmedAt: expect.any(Date),
            });
        });

        it("deve retornar os dados corretos para a situação 'absent'", () => {
            const result = buildPresenceUpdateData("absent");

            expect(result).toEqual({
                confirmada: false,
                confirmedAt: expect.any(Date),
            });
        });
    });

    describe("updatePresenceById", () => {
        it("deve atualizar a presença, invalidar o cache correto e retornar os dados", async () => {
            const mockUpdateData = { confirmada: true, confirmedAt: new Date() };
            const mockUpdatedPresence = {
                id: mockPresenceId,
                confirmada: true,
                confirmedAt: mockUpdateData.confirmedAt,
                userId: mockUserId,
                aulaId: "aula-456",
            };

            vi.mocked(prisma.presenca.update).mockResolvedValue(mockUpdatedPresence as any);

            const result = await updatePresenceById(mockPresenceId, mockUpdateData);

            expect(prisma.presenca.update).toHaveBeenCalledWith({
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
