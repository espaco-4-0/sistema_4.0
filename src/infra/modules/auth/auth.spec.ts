import { signIn } from "next-auth/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "../auth/auth.service";

vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

describe("auth - login()", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it(" login com sucesso", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({
            ok: true,
            error: null,
            status: 200,
            url: "/dashboard",
        });

        const res = await login("admin@teste.com", "123456");
        expect(res?.ok).toBe(true);
        expect(res?.error).toBeNull();
    });

    it("Credenciais invalidas", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({
            ok: false,
            error: "Credenciais inválidas",
            status: 401,
            url: null,
        });

        await expect(login("admin@teste.com", "errado")).rejects.toThrow("Credenciais inválidas");
    });

    it("usuario inativo", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({
            ok: false,
            error: "Usuário inativo",
            status: 403,
            url: null,
        });

        await expect(login("admin@teste.com", "123456")).rejects.toThrow("Usuário inativo");
    });

    it("chama os paramtros corretos", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({
            ok: true,
            error: null,
            status: 200,
            url: "/dashboard",
        });

        await login("admin@teste.com", "123456");

        expect(signIn).toHaveBeenCalledWith("credentials", {
            email: "admin@teste.com",
            password: "123456",
            redirect: false,
        });
    });
});
