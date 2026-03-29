import { NextRequest } from "next/server";

export function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Erro interno do servidor";
}

export function getRequestInfo(request: NextRequest) {
    return `${request.method} ${request.nextUrl.pathname}`;
}
