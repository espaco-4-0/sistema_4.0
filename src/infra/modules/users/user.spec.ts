import { prisma } from "@/src/ui/lib/prisma";
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUser, emailExists, listUsers } from "../users/user.service";

vi.mock("@/lib/cache", () => ({
    invalidateCacheNamespace: vi.fn(),
    rememberCache: vi.fn((key, deps, callback) => callback()),
}));
vi.mock("@/src/ui/lib/prisma", () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
    },
}));

function makeUserPayload(overrides = {}) {
    return {
        nomeCompleto: "Usuario Teste",
        email: "usuario@teste.com",
        senha: "senha123",
        dataNascimento: "2000-01-01",
        telefone: "82999999999",
        raca: "NAO_INFORMADA" as const,
        educacao: "SUPERIOR_CURSANDO" as const,
        ifalAfiliacao: "ALUNO" as const,
        deficiencia: null,
        necessidadeEspecial: null,
        ...overrides,
    };
}

function makePublicUser(overrides = {}) {
    return {
        id: "user-id-1",
        nomeCompleto: "Usuario Teste",
        email: "usuario@teste.com",
        role: "VISITANTE",
        ativo: true,
        createdAt: new Date("2024-01-01"),
        ...overrides,
    };
}

describe("user.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createUser()", () => {
        it("cria usuario com sucesso e retorna campos públicos", async () => {
            const publicUser = makePublicUser();
            vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_senha" as never);
            vi.mocked(prisma.user.create).mockResolvedValueOnce(publicUser as never);

            const result = await createUser(makeUserPayload());

            expect(result).toEqual(publicUser);
        });

        it("usa role VISITANTE por padrão quando não informado", async () => {
            vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_senha" as never);
            vi.mocked(prisma.user.create).mockResolvedValueOnce(makePublicUser() as never);

            await createUser(makeUserPayload());

            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ role: "VISITANTE" }),
                })
            );
        });

        it("respeita role informado no payload", async () => {
            vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_senha" as never);
            vi.mocked(prisma.user.create).mockResolvedValueOnce(makePublicUser({ role: "PROFESSOR" }) as never);

            await createUser(makeUserPayload({ role: "PROFESSOR" }));

            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ role: "PROFESSOR" }),
                })
            );
        });

        it("hasheia a senha antes de salvar", async () => {
            vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_senha" as never);
            vi.mocked(prisma.user.create).mockResolvedValueOnce(makePublicUser() as never);

            await createUser(makeUserPayload({ senha: "senha123" }));

            expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 12);
            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ senha: "hashed_senha" }),
                })
            );
        });

        it("ativo é true por padrão quando não informado", async () => {
            vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashed_senha" as never);
            vi.mocked(prisma.user.create).mockResolvedValueOnce(makePublicUser() as never);

            await createUser(makeUserPayload());

            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ ativo: true }),
                })
            );
        });
    });

    describe("emailExists()", () => {
        it("retorna true quando email já está cadastrado", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: "user-id-1" } as never);

            const result = await emailExists("usuario@teste.com");

            expect(result).toBe(true);
        });

        it("retorna false quando email não existe", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

            const result = await emailExists("novo@teste.com");

            expect(result).toBe(false);
        });

        it("busca pelo email correto", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

            await emailExists("alguem@teste.com");

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "alguem@teste.com" },
                select: { id: true },
            });
        });
    });

    // ── listUsers() ───────────────────────────────────────────────────────────

    describe("listUsers()", () => {
        it("retorna lista paginada de usuários", async () => {
            const users = [makePublicUser(), makePublicUser({ id: "user-id-2", email: "b@teste.com" })];
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce(users as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(2);

            const result = await listUsers({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            });
        });

        it("calcula totalPages corretamente", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(25);

            const result = await listUsers({ page: 1, limit: 10 });

            expect(result.pagination.totalPages).toBe(3);
        });

        it("totalPages é no mínimo 1 mesmo sem resultados", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

            const result = await listUsers({ page: 1, limit: 10 });

            expect(result.pagination.totalPages).toBe(1);
        });

        it("filtra por role quando informado", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

            await listUsers({ page: 1, limit: 10, role: "ADMIN" });

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ role: "ADMIN" }),
                })
            );
        });

        it("ignora role inválido", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

            await listUsers({ page: 1, limit: 10, role: "INVALIDO" });

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.not.objectContaining({ role: expect.anything() }),
                })
            );
        });

        it("filtra por status ativo quando informado", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

            await listUsers({ page: 1, limit: 10, active: "true" });

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ ativo: true }),
                })
            );
        });

        it("aplica busca por nome e email quando search informado", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
            vi.mocked(prisma.user.count).mockResolvedValueOnce(0);

            await listUsers({ page: 1, limit: 10, search: "joao" });

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: [
                            { nomeCompleto: { contains: "joao", mode: "insensitive" } },
                            { email: { contains: "joao", mode: "insensitive" } },
                        ],
                    }),
                })
            );
        });
    });
});
