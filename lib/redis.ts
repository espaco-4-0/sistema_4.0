import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
    redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : (null as unknown as Redis); // O cache.ts deve verificar IS_REDIS_CONFIGURED antes de usar
