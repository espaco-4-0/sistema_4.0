import { Prisma } from "@/src/generated/prisma/client";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";

import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "./AppError";
import { handleError } from "./errorHandler";

async function body(res: Response) {
    return res.json();
}

describe("handleError", () => {
    describe("AppError subclasses", () => {
        it("UnauthorizedError → 401 com code UNAUTHORIZED", async () => {
            const res = handleError(new UnauthorizedError());
            expect(res.status).toBe(401);
            expect(await body(res)).toMatchObject({ message: "Não autenticado", code: "UNAUTHORIZED" });
        });

        it("ForbiddenError → 403 com code FORBIDDEN", async () => {
            const res = handleError(new ForbiddenError("Sem permissao para criar cursos"));
            expect(res.status).toBe(403);
            expect(await body(res)).toMatchObject({ message: "Sem permissao para criar cursos", code: "FORBIDDEN" });
        });

        it("NotFoundError sem id → 404 com code NOT_FOUND", async () => {
            const res = handleError(new NotFoundError("Curso"));
            expect(res.status).toBe(404);
            expect(await body(res)).toMatchObject({ message: "Curso not found", code: "NOT_FOUND" });
        });

        it("NotFoundError com id → 404 com mensagem que inclui o id", async () => {
            const res = handleError(new NotFoundError("Curso", "abc-123"));
            expect(res.status).toBe(404);
            const json = await body(res);
            expect(json.message).toContain("abc-123");
            expect(json.code).toBe("NOT_FOUND");
        });

        it("ValidationError → 422 com code VALIDATION_ERROR", async () => {
            const res = handleError(new ValidationError("Campo obrigatorio ausente"));
            expect(res.status).toBe(422);
            expect(await body(res)).toMatchObject({ message: "Campo obrigatorio ausente", code: "VALIDATION_ERROR" });
        });

        it("ConflictError → 409 com code CONFLICT", async () => {
            const res = handleError(new ConflictError("Voce ja esta inscrito neste curso"));
            expect(res.status).toBe(409);
            expect(await body(res)).toMatchObject({ message: "Voce ja esta inscrito neste curso", code: "CONFLICT" });
        });
    });

    describe("ZodError", () => {
        it("→ 422 com message e array de details", async () => {
            const schema = z.object({ nome: z.string(), idade: z.number() });
            const result = schema.safeParse({ nome: 42, idade: "errado" });
            expect(result.success).toBe(false);

            const res = handleError((result as { success: false; error: ZodError }).error);
            expect(res.status).toBe(422);

            const json = await body(res);
            expect(json.message).toBe("Dados inválidos");
            expect(json.code).toBe("VALIDATION_ERROR");
            expect(Array.isArray(json.details)).toBe(true);
            expect(json.details.length).toBeGreaterThan(0);
            expect(json.details[0]).toHaveProperty("field");
            expect(json.details[0]).toHaveProperty("message");
        });
    });

    describe("Prisma errors", () => {
        it("P2025 (registro nao encontrado) → 404 com code NOT_FOUND", async () => {
            const err = new Prisma.PrismaClientKnownRequestError("Record not found", {
                code: "P2025",
                clientVersion: "test",
            });
            const res = handleError(err);
            expect(res.status).toBe(404);
            expect(await body(res)).toMatchObject({ message: "Recurso não encontrado", code: "NOT_FOUND" });
        });

        it("P2002 (unique constraint) → 409 com code CONFLICT e nome do campo", async () => {
            const err = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                code: "P2002",
                clientVersion: "test",
                meta: { target: ["email"] },
            });
            const res = handleError(err);
            expect(res.status).toBe(409);
            const json = await body(res);
            expect(json.code).toBe("CONFLICT");
            expect(json.message).toContain("email");
        });
    });

    describe("erro desconhecido", () => {
        it("Error generico → 500 com code INTERNAL_ERROR", async () => {
            const res = handleError(new Error("falhou inesperadamente"));
            expect(res.status).toBe(500);
            expect(await body(res)).toMatchObject({ message: "Erro interno do servidor", code: "INTERNAL_ERROR" });
        });

        it("throw de string → 500", async () => {
            const res = handleError("algo estranho");
            expect(res.status).toBe(500);
        });

        it("throw de null → 500", async () => {
            const res = handleError(null);
            expect(res.status).toBe(500);
        });
    });

    describe("formato exato do JSON de erro", () => {
        it("AppError nao expoe stack trace nem campos extras", async () => {
            const res = handleError(new UnauthorizedError());
            const json = await body(res);
            expect(Object.keys(json).sort()).toEqual(["code", "message"]);
        });

        it("ZodError expoe message, code e details — nada alem", async () => {
            const err = z.string().safeParse(42);
            const res = handleError((err as { success: false; error: ZodError }).error);
            const json = await body(res);
            expect(Object.keys(json).sort()).toEqual(["code", "details", "message"]);
        });
    });
});
