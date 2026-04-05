import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
    signIn: mockSignIn,
}));

const defaultCredentials = {
    redirect: false,
    email: "joao@example.com",
    password: "Senha@123",
    remember: "false",
};

async function callSignIn(overrides: object = {}) {
    return mockSignIn("credentials", { ...defaultCredentials, ...overrides });
}

describe("NextAuth signIn (login flow)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Should call signIn with correct credentials", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        await callSignIn();

        expect(mockSignIn).toHaveBeenCalledWith("credentials", defaultCredentials);
    });

    it("Should return error on invalid credentials", async () => {
        mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin" });

        const res = await callSignIn({ password: "senhaerrada" });

        expect(res.ok).toBe(false);
        expect(res.error).toBe("CredentialsSignin");
    });

    it("Should return null response on unexpected error", async () => {
        mockSignIn.mockResolvedValue(null);

        const res = await callSignIn();

        expect(res).toBeNull();
    });

    it("Should pass remember as string to signIn", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        await callSignIn({ remember: String(true) });

        const call = mockSignIn.mock.calls[0][1];
        expect(typeof call.remember).toBe("string");
        expect(call.remember).toBe("true");
    });

    it("Should succeed with remember false", async () => {
        mockSignIn.mockResolvedValue({ ok: true, error: null });

        const res = await callSignIn({ remember: String(false) });

        expect(res.ok).toBe(true);
        expect(res.error).toBeNull();
    });
});
