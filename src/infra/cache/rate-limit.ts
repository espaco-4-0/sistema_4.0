import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter: number;
};

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_SECONDS = 60;

function parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isRedisConfigured(): boolean {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function isRateLimitEnabled(): boolean {
    const value = process.env.RATE_LIMIT_ENABLED;

    if (!value) {
        return process.env.NODE_ENV === "production";
    }

    return value.toLowerCase() === "true";
}

const requestLimit = parsePositiveInt(process.env.RATE_LIMIT_REQUESTS, DEFAULT_LIMIT);
const windowSeconds = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_SECONDS, DEFAULT_WINDOW_SECONDS);

const redis = isRedisConfigured() ? Redis.fromEnv() : null;

const limiter =
    redis && isRateLimitEnabled()
        ? new Ratelimit({
              redis,
              limiter: Ratelimit.slidingWindow(requestLimit, `${windowSeconds} s`),
              prefix: "rate-limit:sistema40",
              analytics: true,
          })
        : null;

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
    if (!limiter) {
        return {
            success: true,
            limit: requestLimit,
            remaining: requestLimit,
            reset: Date.now() + windowSeconds * 1000,
            retryAfter: 0,
        };
    }

    const result = await limiter.limit(identifier);
    const retryAfter = result.success ? 0 : Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));

    return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter,
    };
}
