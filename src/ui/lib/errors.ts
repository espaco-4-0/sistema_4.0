export function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Erro interno do servidor";
}

export function getRequestInfo(request: Request): string {
    try {
        const url = new URL(request.url);
        return `${request.method} ${url.pathname}`;
    } catch {
        return request.method ?? "UNKNOWN";
    }
}
