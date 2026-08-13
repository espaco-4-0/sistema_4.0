import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "./AppError";

export function handleError(error: unknown): NextResponse {
    console.error("[API Error]", error);

    if (error instanceof AppError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: (error.issues ?? []).map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            },
            { status: 422 }
        );
    }

    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
}
