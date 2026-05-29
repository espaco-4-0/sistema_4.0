import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "./AppError";

export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly code?: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        super(id ? `${resource} with id "${id}" not found` : `${resource} not found`, 404, "NOT_FOUND");
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 422, "VALIDATION_ERROR");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}

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
                details: error.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            },
            { status: 422 }
        );
    }

    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
}
