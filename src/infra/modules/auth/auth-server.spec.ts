import { POST as recoveryRoute } from "@/src/app/api/auth/recovery/route";
import { PATCH as resetRoute } from "@/src/app/api/auth/reset/route";
import { ValidationError } from "@/src/lib/errors/AppError";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestPasswordRecovery, resetPasswordWithToken, verifyUserCredentials } from "./auth-server.service";

const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        user: {
            findUnique: (...args: unknown[]) => mockFindUnique(...args),
            findFirst: (...args: unknown[]) => mockFindFirst(...args),
            create: (...args: unknown[]) => mockCreate(...args),
            update: (...args: unknown[]) => mockUpdate(...args),
        },
    },
}));

const mockBcryptHash = vi.fn();
const mockBcryptCompare = vi.fn();

vi.mock("bcryptjs", () => ({
    default: {
        hash: (...args: unknown[]) => mockBcryptHash(...args),
        compare: (...args: unknown[]) => mockBcryptCompare(...args),
    },
}));

const mockJwtSign = vi.fn();

vi.mock("jsonwebtoken", () => ({
    default: {
        sign: (...args: unknown[]) => mockJwtSign(...args),
    },
}));

const mockSendResetPasswordEmail = vi.fn();

vi.mock("@/src/lib/email", () => ({
    sendResetPasswordEmail: (...args: unknown[]) => mockSendResetPasswordEmail(...args),
}));

vi.mock("@/lib/cache", () => ({
    invalidateCacheNamespace: vi.fn(),
}));

function makeRequest(url: string, method: string, body?: Record<string, unknown>): NextRequest {
    return new Request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    }) as unknown as NextRequest;
}

interface JsonResponseBody {
    message?: string;
    code?: string;
    details?: unknown;
}

describe("auth-server.service", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.JWT_SECRET = "test-jwt-secret";
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("verifyUserCredentials", () => {
        const mockUser = {
            id: "user-123",
            email: "user@example.com",
            fullName: "Carlos Eduardo",
            avatarUrl: "http://avatar.com/pic.png",
            role: "STUDENT",
            isActive: true,
            password: "hashed_db_password",
        };

        it("deve retornar o usuário autenticado com remember true", async () => {
            mockFindUnique.mockResolvedValueOnce(mockUser);
            mockBcryptCompare.mockResolvedValueOnce(true);

            const result = await verifyUserCredentials("user@example.com", "senha123", "true");

            expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
            expect(mockBcryptCompare).toHaveBeenCalledWith("senha123", "hashed_db_password");
            expect(result).toEqual({
                id: "user-123",
                email: "user@example.com",
                name: "Carlos Eduardo",
                image: "http://avatar.com/pic.png",
                role: "STUDENT",
                remember: true,
            });
        });

        it("deve retornar o usuário com remember false quando remember não for 'true'", async () => {
            mockFindUnique.mockResolvedValueOnce(mockUser);
            mockBcryptCompare.mockResolvedValueOnce(true);

            const result = await verifyUserCredentials("user@example.com", "senha123", "false");

            expect(result).toEqual(expect.objectContaining({ remember: false }));
        });

        it("deve retornar null se usuário não existir", async () => {
            mockFindUnique.mockResolvedValueOnce(null);

            const result = await verifyUserCredentials("inexistente@example.com", "senha123");

            expect(result).toBeNull();
            expect(mockBcryptCompare).not.toHaveBeenCalled();
        });

        it("deve retornar null se usuário estiver inativo", async () => {
            mockFindUnique.mockResolvedValueOnce({ ...mockUser, isActive: false });

            const result = await verifyUserCredentials("user@example.com", "senha123");

            expect(result).toBeNull();
            expect(mockBcryptCompare).not.toHaveBeenCalled();
        });

        it("deve retornar null se a senha estiver incorreta", async () => {
            mockFindUnique.mockResolvedValueOnce(mockUser);
            mockBcryptCompare.mockResolvedValueOnce(false);

            const result = await verifyUserCredentials("user@example.com", "senhaErrada");

            expect(result).toBeNull();
        });
    });

    describe("requestPasswordRecovery", () => {
        it("deve gerar token, atualizar usuário e enviar e-mail se usuário existir", async () => {
            mockFindUnique.mockResolvedValueOnce({
                id: "user-123",
                email: "user@example.com",
                fullName: "Carlos Eduardo",
            });
            mockJwtSign.mockReturnValueOnce("signed-token-123");
            mockUpdate.mockResolvedValueOnce({});
            mockSendResetPasswordEmail.mockResolvedValueOnce(undefined);

            await requestPasswordRecovery("user@example.com");

            expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
            expect(mockJwtSign).toHaveBeenCalledWith({ userId: "user-123" }, "test-jwt-secret", { expiresIn: "1h" });
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: "user-123" },
                data: {
                    resetToken: "signed-token-123",
                    resetTokenExpiresAt: expect.any(Date),
                },
            });
            expect(mockSendResetPasswordEmail).toHaveBeenCalledWith(
                "user@example.com",
                "Carlos Eduardo",
                "http://localhost:3000/reset-password?token=signed-token-123"
            );
        });

        it("deve usar 'Usuário' como fallback de nome quando fullName for nulo", async () => {
            mockFindUnique.mockResolvedValueOnce({
                id: "user-123",
                email: "user@example.com",
                fullName: null,
            });
            mockJwtSign.mockReturnValueOnce("signed-token-123");
            mockUpdate.mockResolvedValueOnce({});
            mockSendResetPasswordEmail.mockResolvedValueOnce(undefined);

            await requestPasswordRecovery("user@example.com");

            expect(mockSendResetPasswordEmail).toHaveBeenCalledWith(
                "user@example.com",
                "Usuário",
                "http://localhost:3000/reset-password?token=signed-token-123"
            );
        });

        it("não deve enviar e-mail nem falhar se o usuário não existir", async () => {
            mockFindUnique.mockResolvedValueOnce(null);

            await requestPasswordRecovery("naocadastrado@example.com");

            expect(mockUpdate).not.toHaveBeenCalled();
            expect(mockSendResetPasswordEmail).not.toHaveBeenCalled();
        });

        it("deve lançar erro se JWT_SECRET não estiver definido", async () => {
            delete process.env.JWT_SECRET;
            mockFindUnique.mockResolvedValueOnce({
                id: "user-123",
                email: "user@example.com",
                fullName: "Carlos Eduardo",
            });

            await expect(requestPasswordRecovery("user@example.com")).rejects.toThrow(
                "JWT_SECRET não definido no .env"
            );
            expect(mockSendResetPasswordEmail).not.toHaveBeenCalled();
        });
    });

    describe("resetPasswordWithToken", () => {
        it("deve atualizar a senha com hash e limpar os tokens de recuperação", async () => {
            mockFindFirst.mockResolvedValueOnce({
                id: "user-123",
                email: "user@example.com",
            });
            mockBcryptHash.mockResolvedValueOnce("new-hashed-password");
            mockUpdate.mockResolvedValueOnce({});

            await resetPasswordWithToken("token-valido", "novaSenha@123");

            expect(mockFindFirst).toHaveBeenCalledWith({
                where: {
                    resetToken: "token-valido",
                    resetTokenExpiresAt: { gt: expect.any(Date) },
                },
            });
            expect(mockBcryptHash).toHaveBeenCalledWith("novaSenha@123", 10);
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: "user-123" },
                data: {
                    password: "new-hashed-password",
                    resetToken: null,
                    resetTokenExpiresAt: null,
                },
            });
        });

        it("deve lançar ValidationError se o token for inválido ou estiver expirado", async () => {
            mockFindFirst.mockResolvedValueOnce(null);

            await expect(resetPasswordWithToken("token-invalido", "novaSenha@123")).rejects.toThrow(ValidationError);
            await expect(resetPasswordWithToken("token-invalido", "novaSenha@123")).rejects.toThrow(
                "Token inválido ou expirado. Solicite um novo link."
            );
            expect(mockUpdate).not.toHaveBeenCalled();
        });
    });
});

describe("Rotas de Autenticação", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = "test-jwt-secret";
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });

    describe("POST /api/auth/recovery", () => {
        it("deve retornar 422 quando email for ausente ou inválido", async () => {
            const req = makeRequest("http://localhost/api/auth/recovery", "POST", {});
            const res = await recoveryRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(422);
            expect(body.code).toBe("VALIDATION_ERROR");
        });

        it("deve retornar 200 com mensagem informativa quando o e-mail for válido", async () => {
            mockFindUnique.mockResolvedValueOnce(null);

            const req = makeRequest("http://localhost/api/auth/recovery", "POST", { email: "user@example.com" });
            const res = await recoveryRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(200);
            expect(body.message).toBe("Se o e-mail estiver cadastrado, um link de recuperação foi enviado.");
        });

        it("deve retornar 500 se o serviço lançar um erro inesperado", async () => {
            delete process.env.JWT_SECRET;
            mockFindUnique.mockResolvedValueOnce({ id: "user-123", email: "user@example.com" });

            const req = makeRequest("http://localhost/api/auth/recovery", "POST", { email: "user@example.com" });
            const res = await recoveryRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(500);
            expect(body.code).toBe("INTERNAL_ERROR");
        });
    });

    describe("PATCH /api/auth/reset", () => {
        it("deve retornar 422 quando token ou novaSenha não forem informados", async () => {
            const req = makeRequest("http://localhost/api/auth/reset", "PATCH", { token: "token-123" });
            const res = await resetRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(422);
            expect(body.code).toBe("VALIDATION_ERROR");
        });

        it("deve retornar 200 quando a senha for redefinida com sucesso", async () => {
            mockFindFirst.mockResolvedValueOnce({ id: "user-123", email: "user@example.com" });
            mockBcryptHash.mockResolvedValueOnce("new-hashed-password");
            mockUpdate.mockResolvedValueOnce({});

            const req = makeRequest("http://localhost/api/auth/reset", "PATCH", {
                token: "token-valido",
                novaSenha: "novaSenha@123",
            });
            const res = await resetRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(200);
            expect(body.message).toBe("Senha redefinida com sucesso");
        });

        it("deve retornar 422 quando o token for inválido ou expirado (ValidationError do service)", async () => {
            mockFindFirst.mockResolvedValueOnce(null);

            const req = makeRequest("http://localhost/api/auth/reset", "PATCH", {
                token: "token-expirado",
                novaSenha: "novaSenha@123",
            });
            const res = await resetRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(422);
            expect(body.code).toBe("VALIDATION_ERROR");
            expect(body.message).toBe("Token inválido ou expirado. Solicite um novo link.");
        });

        it("deve retornar 500 se o banco falhar inesperadamente", async () => {
            mockFindFirst.mockRejectedValueOnce(new Error("Falha no banco"));

            const req = makeRequest("http://localhost/api/auth/reset", "PATCH", {
                token: "token-valido",
                novaSenha: "novaSenha@123",
            });
            const res = await resetRoute(req);
            const body = (await res.json()) as JsonResponseBody;

            expect(res.status).toBe(500);
            expect(body.code).toBe("INTERNAL_ERROR");
        });
    });
});
