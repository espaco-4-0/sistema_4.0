import { userLoginSchema } from "@/src/ui/forms/schemas/user-login-schema";
import { userRegistrationSchema } from "@/src/ui/forms/schemas/user-registration-schema";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

function makeRegisterRequest(body: object) {
    return new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const validRegistrationBody = {
    completeName: "João Silva",
    email: "joao@example.com",
    password: "Senha@123",
    dateOfBirth: "1995-01-01T00:00:00.000Z",
    telephone: "(82) 99999-9999",
    race: "BRANCA",
    education: "SUPERIOR_COMPLETO",
    ifal_afiliation: "ALUNO",
};

describe("userLoginSchema", () => {
    it("Should validate correct login", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(true);
    });

    it("Should reject invalid email", () => {
        const result = userLoginSchema.safeParse({
            email: "emailinvalido",
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Por favor, insira um endereço de e-mail válido");
    });

    it("Should reject empty password", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "",
            remember: false,
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Por favor, insira sua senha");
    });

    it("Should reject when email is missing", () => {
        const result = userLoginSchema.safeParse({
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(false);
    });
});

describe("userRegistrationSchema", () => {
    it("Should validate correct registration", () => {
        const result = userRegistrationSchema.safeParse(validRegistrationBody);
        expect(result.success).toBe(true);
    });

    it("Should reject name without last name", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            completeName: "Joãozinho",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Por favor, insira o nome e sobrenome");
    });

    it("Should reject name with less than 6 characters", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            completeName: "Jo Si",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("O nome completo deve ter no mínimo 6 caracteres");
    });

    it("Should reject invalid email", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            email: "invalido",
        });
        expect(result.success).toBe(false);
    });

    it("Should reject password without uppercase letter", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            password: "senha@123",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Deve conter pelo menos uma letra maiúscula");
    });

    it("Should reject password without special character", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            password: "Senha1234",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Deve conter pelo menos um caractere especial (@, #, $, etc.)");
    });

    it("Should reject password without number", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            password: "Senha@abc",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Deve conter pelo menos um número");
    });

    it("Should reject date of birth with age under 16 years", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            dateOfBirth: new Date().toISOString(),
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
            "Data inválida ou idade fora do intervalo permitido (16–120 anos)"
        );
    });

    it("Should reject telephone with invalid format", () => {
        const result = userRegistrationSchema.safeParse({
            ...validRegistrationBody,
            telephone: "82999999999",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Formato inválido. Use (00) 00000-0000");
    });
});

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Should create user with valid data", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: "123" });

        const { POST } = await import("@/src/app/api/auth/register/route");

        const req = makeRegisterRequest(validRegistrationBody);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.message).toBe("Usuário criado com sucesso");
    });

    it("Should reject already registered email", async () => {
        mockFindUnique.mockResolvedValue({ id: "123" });

        const { POST } = await import("@/src/app/api/auth/register/route");

        const req = makeRegisterRequest(validRegistrationBody);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(409);
        expect(body.message).toBe("Email já cadastrado");
    });

    it("Should reject invalid body", async () => {
        const { POST } = await import("@/src/app/api/auth/register/route");

        const req = makeRegisterRequest({ email: "invalido" });
        const res = await POST(req as any);

        expect(res.status).toBe(400);
    });

    it("Should return 500 if database fails", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockRejectedValue(new Error("DB connection failed"));

        const { POST } = await import("@/src/app/api/auth/register/route");

        const req = makeRegisterRequest(validRegistrationBody);
        const res = await POST(req as any);

        expect(res.status).toBe(500);
    });

    it("Should hash password before saving", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({ id: "123" });

        const bcrypt = await import("bcryptjs");
        const { POST } = await import("@/src/app/api/auth/register/route");

        const req = makeRegisterRequest(validRegistrationBody);
        await POST(req as any);

        expect(bcrypt.default.hash).toHaveBeenCalledWith(validRegistrationBody.password, 12);
        const createCall = mockCreate.mock.calls[0][0].data;
        expect(createCall.senha).toBe("hashed_password");
        expect(createCall.senha).not.toBe(validRegistrationBody.password);
    });
});

const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
    signIn: mockSignIn,
}));

describe("userLoginSchema", () => {
    it("Should validate correct login", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(true);
    });

    it("Should reject invalid email", () => {
        const result = userLoginSchema.safeParse({
            email: "emailinvalido",
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Por favor, insira um endereço de e-mail válido");
    });

    it("Should reject empty password", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "",
            remember: false,
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe("Por favor, insira sua senha");
    });

    it("Should reject when email is missing", () => {
        const result = userLoginSchema.safeParse({
            password: "senha123",
            remember: false,
        });
        expect(result.success).toBe(false);
    });

    it("Should reject when password is missing", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            remember: false,
        });
        expect(result.success).toBe(false);
    });

    it("Should accept remember as true", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "senha123",
            remember: true,
        });
        expect(result.success).toBe(true);
        expect(result.data?.remember).toBe(true);
    });

    it("Should reject remember as non-boolean", () => {
        const result = userLoginSchema.safeParse({
            email: "joao@example.com",
            password: "senha123",
            remember: "true", // string em vez de boolean
        });
        expect(result.success).toBe(false);
    });
});

describe("NextAuth signIn (login flow)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Should call signIn with correct credentials", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        await mockSignIn("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "Senha@123",
            remember: "false",
        });

        expect(mockSignIn).toHaveBeenCalledWith("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "Senha@123",
            remember: "false",
        });
    });

    it("Should return error on invalid credentials", async () => {
        mockSignIn.mockResolvedValue({
            ok: false,
            error: "CredentialsSignin",
        });

        const res = await mockSignIn("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "senhaerrada",
            remember: "false",
        });

        expect(res.error).toBe("CredentialsSignin");
        expect(res.ok).toBe(false);
    });

    it("Should return null response on unexpected error", async () => {
        mockSignIn.mockResolvedValue(null);

        const res = await mockSignIn("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "Senha@123",
            remember: "false",
        });

        expect(res).toBeNull();
    });

    it("Should pass remember as string to signIn", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        await mockSignIn("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "Senha@123",
            remember: String(true), // garante que boolean virou string
        });

        const call = mockSignIn.mock.calls[0][1];
        expect(typeof call.remember).toBe("string");
        expect(call.remember).toBe("true");
    });

    it("Should succeed with remember false", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        const res = await mockSignIn("credentials", {
            redirect: false,
            email: "joao@example.com",
            password: "Senha@123",
            remember: String(false),
        });

        expect(res.ok).toBe(true);
        expect(res.error).toBeNull();
    });
});
