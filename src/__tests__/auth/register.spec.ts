import { POST } from "@/src/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Education, IfalAffiliation, Race } from "../../generated/prisma/enums";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/cache", () => ({
    invalidateCacheNamespace: vi.fn(),
    rememberCache: vi.fn((_key, _deps, callback: () => unknown) => callback()),
}));

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        user: {
            findUnique: (...args: unknown[]) => mockFindUnique(...args),
            create: (...args: unknown[]) => mockCreate(...args),
        },
    },
}));

const mockBcryptHash = vi.fn().mockResolvedValue("hashed_password");
const mockBcryptCompare = vi.fn().mockResolvedValue(true);

vi.mock("bcryptjs", () => ({
    default: {
        hash: (...args: unknown[]) => mockBcryptHash(...args),
        compare: (...args: unknown[]) => mockBcryptCompare(...args),
    },
    hash: (...args: unknown[]) => mockBcryptHash(...args),
    compare: (...args: unknown[]) => mockBcryptCompare(...args),
}));

const validRegistrationBody = {
    completeName: "João Silva",
    email: "joao@example.com",
    password: "Senha@123",
    dateOfBirth: "1995-01-01T00:00:00.000Z",
    telephone: "(82) 99999-9999",
    race: Race.WHITE,
    education: Education.HIGHER_EDUCATION_COMPLETE,
    ifalAffiliation: IfalAffiliation.STUDENT,
};

// Helpers
function makeRegisterRequest(body: object) {
    return new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

async function callPOST(body: object = validRegistrationBody) {
    const res = await POST(makeRegisterRequest(body) as unknown as NextRequest);
    return { res, body: (await res.json()) as { message?: string; code?: string } };
}

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBcryptHash.mockResolvedValue("hashed_password");
        mockBcryptCompare.mockResolvedValue(true);
    });

    it("Should create user with valid data", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: "123" });

        const { res, body } = await callPOST();

        expect(res.status).toBe(201);
        expect(body.message).toBe("Usuário criado com sucesso");
    });

    it("Should reject already registered email", async () => {
        mockFindUnique.mockResolvedValue({ id: "123" });

        const { res, body } = await callPOST();

        expect(res.status).toBe(409);
        expect(body.message).toBe("Email já cadastrado");
    });

    it("Should reject invalid body", async () => {
        const { res, body } = await callPOST({ email: "invalido" });
        expect(res.status).toBe(422);
        expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("Should return 500 if database fails", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockRejectedValue(new Error("DB connection failed"));

        const { res } = await callPOST();
        expect(res.status).toBe(500);
    });

    it("Should hash password before saving", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: "123" });

        await callPOST();

        const createCall = mockCreate.mock.calls[0][0].data;
        expect(mockBcryptHash).toHaveBeenCalledWith(validRegistrationBody.password, 12);
        expect(createCall.password).toBe("hashed_password");
        expect(createCall.password).not.toBe(validRegistrationBody.password);
    });
});
