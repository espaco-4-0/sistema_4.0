import { redis } from "./redis";

const isRedisConfigured = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

function buildVersionKey(namespace: string): string {
    return `cache:version:${namespace}`;
}

function buildDataKey(namespace: string, version: number, key: string): string {
    return `cache:${namespace}:v${version}:${key}`;
}

async function getNamespaceVersion(namespace: string): Promise<number> {
    if (!isRedisConfigured) return 1;
    return (await redis.get<number>(buildVersionKey(namespace))) ?? 1;
}

export async function invalidateCacheNamespace(namespace: string): Promise<void> {
    if (!isRedisConfigured) return;
    await redis.incr(buildVersionKey(namespace));
}

export async function rememberCache<T>(
    namespace: string,
    key: string,
    loader: () => Promise<T>,
    ttlSeconds = 60
): Promise<T> {
    if (!isRedisConfigured) return loader();

    const version = await getNamespaceVersion(namespace);
    const cacheKey = buildDataKey(namespace, version, key);

    const cached = await redis.get<T>(cacheKey);

    if (cached) {
        if (typeof cached === "string") {
            try {
                return JSON.parse(cached) as T;
            } catch {
                return cached as unknown as T;
            }
        }
        return cached;
    }

    const value = await loader();

    const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
    await redis.set(cacheKey, valueToStore, { ex: ttlSeconds });

    return value;
}
