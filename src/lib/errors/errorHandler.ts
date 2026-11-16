import { Prisma } from "@/src/generated/prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "./AppError";

export function handleError(error: unknown): NextResponse {
    console.error("[API Error]", error);

    if (error instanceof AppError) {
        return NextResponse.json({ message: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                message: "Dados inválidos",
                code: "VALIDATION_ERROR",
                details: (error.issues ?? []).map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            },
            { status: 422 }
        );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return NextResponse.json({ message: "Recurso não encontrado", code: "NOT_FOUND" }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const fields = (error.meta?.target as string[] | undefined)?.join(", ") ?? "campo";
        return NextResponse.json(
            { message: `Já existe um registro com o mesmo ${fields}`, code: "CONFLICT" },
            { status: 409 }
        );
    }

    return NextResponse.json({ message: "Erro interno do servidor", code: "INTERNAL_ERROR" }, { status: 500 });
}
