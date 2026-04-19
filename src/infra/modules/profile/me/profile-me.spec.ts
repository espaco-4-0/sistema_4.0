import { invalidateCacheNamespace, rememberCache } from "@/lib/cache";
import { prisma } from "@/src/infra/data/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpdateProfilePayload } from "./profile-me.schema";
import { emailExistsForAnotherProfile, getProfileById, updateProfileById } from "./profile-me.service";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/cache", () => ({
    rememberCache: vi.fn(),
    invalidateCacheNamespace: vi.fn(),
}));

describe("Profile Service", () => {
    const mockUserId = "user-123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProfileById", () => {
        it("deve retornar os dados de perfil dos mocks", async () => {
            const mockProfile = { id: mockUserId, nomeCompleto: "Jõao Silva", email: "Joao@teste.com" };

            vi.mocked(rememberCache).mockImplementation(async (namespace, key, callback) => {
                return await callback();
            });

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile as any);

            const result = await getProfileById(mockUserId);

            expect(rememberCache).toHaveBeenCalledWith("profile:me", mockUserId, expect.any(Function), 120);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUserId },
                select: expect.any(Object),
            });
            expect(result).toEqual(mockProfile);
        });
    });

    describe("emailExistsForAnotherProfile", () => {
        const testEmail = "teste@tes.com";

        // CORREÇÃO: Adicionado o 'async' aqui antes dos parênteses
        it("deve retornar TRUE se o email já estiver em uso por outro user", async () => {
            vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "outro-user-id" } as any);

            const result = await emailExistsForAnotherProfile(mockUserId, testEmail);

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { email: testEmail, id: { not: mockUserId } },
                select: { id: true },
            });
            expect(result).toBe(true);
        });

        it("deve retornar FALSE se o email não estiver em uso por outro usuário", async () => {
            vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

            const result = await emailExistsForAnotherProfile(mockUserId, testEmail);

            expect(result).toBe(false);
        });
    });

    describe("updateProfileById", () => {
        it("deve atualizar os dados do usuário convertendo e invalidando o cache", async () => {
            const payload: UpdateProfilePayload = {
                nomeCompleto: "Maria Silva",
                dataNascimento: "1990-01-01T00:00:00.000Z",
            };

            const mockUpdatedUser = {
                id: mockUserId,
                nomeCompleto: "Maria Silva",
                updateAt: new Date(),
            };

            vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any);

            const result = await updateProfileById(mockUserId, payload);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: {
                    nomeCompleto: "Maria Silva",
                    dataNascimento: new Date("1990-01-01T00:00:00.000Z"),
                },
                select: expect.any(Object),
            });
            expect(invalidateCacheNamespace).toHaveBeenCalledTimes(2);
            expect(invalidateCacheNamespace).toHaveBeenCalledWith("profile:me");
            expect(invalidateCacheNamespace).toHaveBeenCalledWith("users:list");

            expect(result).toEqual(mockUpdatedUser);
        });

        it("deve enviar apenas os campos definidos no payload para o banco (Partial Update)", async () => {
            const payload: UpdateProfilePayload = {
                telefone: "11999999999",
            };

            await updateProfileById(mockUserId, payload);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: {
                    telefone: "11999999999",
                },
                select: expect.any(Object),
            });
        });
    });
});
