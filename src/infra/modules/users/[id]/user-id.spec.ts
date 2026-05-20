import { prisma } from "@/src/infra/data/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserById } from "./user-id.service";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

function searchPublicUser(overrides: Record<string, any> = {}) {
    return {
        id: "1",
        nomeCompleto: "Usuario teste",
        email: "user@test.com",
        role: "professor",
        ativo: true,
        createAt: new Date("2024-01-01"),
        ...overrides,
    };
}

describe("user.service - getUserById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getUserById()", () => {
        it("should return user data when user exists", async () => {
            const fakeUser = searchPublicUser();
            (prisma.user.findUnique as any).mockResolvedValue(fakeUser);

            const result = await getUserById(fakeUser.id);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: fakeUser.id },
            });
            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(result).toEqual(fakeUser);
        });

        it("should return null when user does not exist", async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            const result = await getUserById("999");

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: "999" },
            });
            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });

        it("should propagate errors from the database", async () => {
            (prisma.user.findUnique as any).mockRejectedValue(new Error("DB error"));

            await expect(getUserById("")).rejects.toThrow("DB error");

            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
        });
    });
});
