import { redis } from "./redis";

const IS_REDIS_CONFIGURED = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function buildVersionKey(namespace: string): string {
    return `cache:version:${namespace}`;
}

function buildDataKey(namespace: string, version: number, key: string): string {
    return `cache:${namespace}:v${version}:${key}`;
}

async function getNamespaceVersion(namespace: string): Promise<number> {
    if (!IS_REDIS_CONFIGURED) return 1;
    try {
        return (await redis.get<number>(buildVersionKey(namespace))) ?? 1;
    } catch (err) {
        console.warn("[Cache] Falha ao obter versão do namespace, usando padrão 1", err);
        return 1;
    }
}

export async function invalidateCacheNamespace(namespace: string): Promise<void> {
    if (!IS_REDIS_CONFIGURED) return;
    try {
        await redis.incr(buildVersionKey(namespace));
    } catch (err) {
        console.warn("[Cache] Falha ao invalidar cache", err);
    }
}

export async function rememberCache<T>(
    namespace: string,
    key: string,
    loader: () => Promise<T>,
    ttlSeconds = 60
): Promise<T> {
    if (!IS_REDIS_CONFIGURED) {
        return loader();
    }

    try {
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
    } catch (err) {
        console.warn("[Cache] Erro na camada de cache, carregando dados diretamente", err);
        return loader();
    }
}
