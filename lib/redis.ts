import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set."
      );
    }

    redisClient = new Redis({ url, token });
  }

  return redisClient;
}
