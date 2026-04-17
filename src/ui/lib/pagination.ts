export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const MAX_SEARCH_LENGHT = 100;

export function toPositiveInt(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return parsed > 0 ? parsed : fallback;
}

export function parsePaginationParams(searchParams: URLSearchParams): {
    page: number;
    limit: number;
} {
    const page = toPositiveInt(searchParams.get("page"), DEFAULT_PAGE);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
    return { page, limit };
}

export function sanitizeSearch(raw: string | null): string {
    return (raw?.trim() ?? "").slice(0, MAX_SEARCH_LENGHT);
}
