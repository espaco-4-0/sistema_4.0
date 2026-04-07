import "server-only";

import { redis } from "@/lib/redis";

type CachedValue = string;

function buildVersionKey(namespace: string): string {
    return `cache:version:${namespace}`;
}

function buildDataKey(namespace: string, version: number, key: string): string {
    return `cache:${namespace}:v${version}:${key}`;
}

async function getNamespaceVersion(namespace: string): Promise<number> {
    return (await redis.get<number>(buildVersionKey(namespace))) ?? 1;
}

export async function invalidateCacheNamespace(namespace: string): Promise<void> {
    await redis.incr(buildVersionKey(namespace));
}

export async function rememberCache<T>(
    namespace: string,
    key: string,
    loader: () => Promise<T>,
    ttlSeconds = 60
): Promise<T> {
    const version = await getNamespaceVersion(namespace);
    const cacheKey = buildDataKey(namespace, version, key);
    const cached = await redis.get<CachedValue>(cacheKey);

    if (cached) {
        return JSON.parse(cached) as T;
    }

    const value = await loader();
    await redis.set(cacheKey, JSON.stringify(value), { ex: ttlSeconds });

    return value;
}
