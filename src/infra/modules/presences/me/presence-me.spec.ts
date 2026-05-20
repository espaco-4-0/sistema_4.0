import { rememberCache } from "@/lib/cache";
import { prisma } from "@/src/infra/data/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listPresenceEventsByUser } from "./presence-me.service";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        presence: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/cache", () => ({
    rememberCache: vi.fn(async (key, userId, callback, ttl) => {
        return await callback();
    }),
}));

describe("listPresenceEventsByUser", () => {
    const mockUserId = "user-123";
    const baseDate = new Date("2026-04-13T10:00:00Z");

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createMockPresence = (overrides = {}) => ({
        id: "presence-1",
        userId: mockUserId,
        confirmed: true,
        confirmedAt: new Date("2026-04-13T09:50:00Z"),
        createdAt: new Date("2026-04-10T10:00:00Z"),
        lessonId: "lesson-1",
        enrollmentId: null,
        lesson: {
            startDate: baseDate,
            durationMin: 120,
            title: "Aula de TypeScript",
            professor: { fullName: "Professor Silva" },
            location: { name: "Laboratório 1" },
            course: { title: "Desenvolvimento Web", description: "Curso completo" },
        },
        ...overrides,
    });

    it("retornar a lista de presenças formatada corretamente com todos os dados preenchidos", async () => {
        vi.mocked(prisma.presence.findMany).mockResolvedValue([createMockPresence()]);

        const result = await listPresenceEventsByUser(mockUserId);

        expect(prisma.presence.findMany).toHaveBeenCalledWith({
            where: { userId: mockUserId },
            orderBy: { createdAt: "asc" },
            include: expect.any(Object),
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: "presence-1",
            title: "Aula de TypeScript",
            description: "Curso completo",
            instructor: "Professor Silva",
            location: "Laboratório 1",
            situation: "confirmed",
            observation: "",
            registeredAt: new Date("2026-04-13T09:50:00Z"),
            start: baseDate,
            end: new Date("2026-04-13T12:00:00Z"),
        });
    });

    it("aplicar os fallbacks corretamente quando dados opcionais faltarem (Título, Descrição, Local)", async () => {
        vi.mocked(prisma.presence.findMany).mockResolvedValue([
            createMockPresence({
                lesson: {
                    startDate: baseDate,
                    durationMin: 60,
                    title: null,
                    professor: { fullName: "Professor Silva" },
                    location: null,
                    course: { title: "Curso Básico", description: null },
                },
            }),
        ]);

        const result = await listPresenceEventsByUser(mockUserId);

        expect(result[0].title).toBe("Curso Básico");
        expect(result[0].description).toBe("Atividade do Espaço 4.0");
        expect(result[0].location).toBe("Local a definir");
    });

    describe("Cálculo da Situação (EventSituation)", () => {
        it('deve retornar "confirmed" se a presença estiver confirmada', async () => {
            vi.mocked(prisma.presence.findMany).mockResolvedValue([
                createMockPresence({ confirmed: true, confirmedAt: new Date() }),
            ]);
            const result = await listPresenceEventsByUser(mockUserId);
            expect(result[0].situation).toBe("confirmed");
        });

        it('deve retornar "absent" se a presença não estiver confirmada mas tiver data de registro (confirmedAt)', async () => {
            vi.mocked(prisma.presence.findMany).mockResolvedValue([
                createMockPresence({ confirmed: false, confirmedAt: new Date() }),
            ]);
            const result = await listPresenceEventsByUser(mockUserId);
            expect(result[0].situation).toBe("absent");
        });

        it('deve retornar "pending" se a presença não estiver confirmada e não tiver data de registro', async () => {
            vi.mocked(prisma.presence.findMany).mockResolvedValue([
                createMockPresence({ confirmed: false, confirmedAt: null }),
            ]);
            const result = await listPresenceEventsByUser(mockUserId);
            expect(result[0].situation).toBe("pending");
        });
    });

    it(" utilizar a camada de cache passando os parametros corretos", async () => {
        vi.mocked(prisma.presence.findMany).mockResolvedValue([]);

        await listPresenceEventsByUser(mockUserId);

        expect(rememberCache).toHaveBeenCalledWith("presences:me", mockUserId, expect.any(Function), 60);
    });
});
