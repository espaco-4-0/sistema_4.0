import { userLoginSchema } from "@/src/ui/forms/schemas/user-login-schema";
import { userRegistrationSchema } from "@/src/ui/forms/schemas/user-registration-schema";
import { describe, expect, it } from "vitest";

import { Education, IfalAffiliation, Race } from "../../generated/prisma/enums";

const validRegistrationBody = {
    completeName: "João Silva",
    email: "joao@example.com",
    password: "Senha@123",
    dateOfBirth: "1995-01-01T00:00:00.000Z",
    telephone: "(82) 99999-9999",
    race: Race.BRANCA,
    education: Education.SUPERIOR_COMPLETO,
    ifalAffiliation: IfalAffiliation.ALUNO,
};

const validLoginBody = {
    email: "joao@example.com",
    password: "senha123",
    remember: false,
};

// Helpers
function parseLogin(overrides = {}) {
    return userLoginSchema.safeParse({ ...validLoginBody, ...overrides });
}

function parseRegistration(overrides = {}) {
    return userRegistrationSchema.safeParse({ ...validRegistrationBody, ...overrides });
}

function expectSuccess(result: ReturnType<typeof parseLogin | typeof parseRegistration>) {
    expect(result.success).toBe(true);
}

function expectFailure(result: ReturnType<typeof parseLogin | typeof parseRegistration>, message?: string) {
    expect(result.success).toBe(false);
    if (message) {
        expect(result.error?.issues[0].message).toBe(message);
    }
}

describe("userLoginSchema", () => {
    it("Should validate correct login", () => {
        expectSuccess(parseLogin());
    });

    it("Should reject invalid email", () => {
        expectFailure(parseLogin({ email: "emailinvalido" }), "Por favor, insira um endereço de e-mail válido");
    });

    it("Should reject empty password", () => {
        expectFailure(parseLogin({ password: "" }), "Por favor, insira sua senha");
    });

    it("Should reject when email is missing", () => {
        expectFailure(parseLogin({ email: undefined }));
    });

    it("Should reject when password is missing", () => {
        expectFailure(parseLogin({ password: undefined }));
    });

    it("Should accept remember as true", () => {
        const result = parseLogin({ remember: true });
        expectSuccess(result);
        expect(result.data?.remember).toBe(true);
    });

    it("Should reject remember as non-boolean", () => {
        expectFailure(parseLogin({ remember: "true" }));
    });
});

describe("userRegistrationSchema", () => {
    it("Should validate correct registration", () => {
        expectSuccess(parseRegistration());
    });

    it.each([
        ["name without last name", { completeName: "Joãozinho" }, "Por favor, insira o nome e sobrenome"],
        [
            "name with less than 6 characters",
            { completeName: "Jo Si" },
            "O nome completo deve ter no mínimo 6 caracteres",
        ],
        ["password without uppercase letter", { password: "senha@123" }, "Deve conter pelo menos uma letra maiúscula"],
        [
            "password without special character",
            { password: "Senha1234" },
            "Deve conter pelo menos um caractere especial (@, #, $, etc.)",
        ],
        ["password without number", { password: "Senha@abc" }, "Deve conter pelo menos um número"],
        ["telephone with invalid format", { telephone: "82999999999" }, "Formato inválido. Use (00) 00000-0000"],
        [
            "date of birth with age under 16 years",
            { dateOfBirth: new Date().toISOString() },
            "Data inválida ou idade fora do intervalo permitido (16–120 anos)",
        ],
    ])("Should reject %s", (_, overrides, message) => {
        expectFailure(parseRegistration(overrides), message);
    });

    it("Should reject invalid email", () => {
        expectFailure(parseRegistration({ email: "invalido" }));
    });
});
