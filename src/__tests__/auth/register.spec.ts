import { beforeEach, describe, expect, it, vi } from "vitest";

import { Education, Race, ifalAffiliation } from "../../generated/prisma/enums";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/src/ui/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: mockFindUnique,
            create: mockCreate,
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("hashed_password"),
        compare: vi.fn().mockResolvedValue(true),
    },
}));

const validRegistrationBody = {
    completeName: "João Silva",
    email: "joao@example.com",
    password: "Senha@123",
    dateOfBirth: "1995-01-01T00:00:00.000Z",
    telephone: "(82) 99999-9999",
    race: Race.BRANCA,
    education: Education.SUPERIOR_COMPLETO,
    ifalAffiliation: ifalAffiliation.ALUNO,
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
    const { POST } = await import("@/src/app/api/auth/register/route");
    const res = await POST(makeRegisterRequest(body) as any);
    return { res, body: await res.json() };
}

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        const { res } = await callPOST({ email: "invalido" });
        expect(res.status).toBe(400);
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

        const bcrypt = await import("bcryptjs");
        await callPOST();

        const createCall = mockCreate.mock.calls[0][0].data;
        expect(bcrypt.default.hash).toHaveBeenCalledWith(validRegistrationBody.password, 12);
        expect(createCall.senha).toBe("hashed_password");
        expect(createCall.senha).not.toBe(validRegistrationBody.password);
    });
});
