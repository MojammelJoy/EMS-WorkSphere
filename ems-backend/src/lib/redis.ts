import Redis from "ioredis";
import { config } from "@/config";
import { logger } from "@/utils/logger";

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null,
  reconnectOnError: () => false,
});

redis.on("connect",    () => logger.info("Redis connected"));
redis.on("error",  (e) => logger.error("Redis error", e));
redis.on("close",      () => logger.warn("Redis connection closed"));

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await redis.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch { return null; }
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch { /* non-fatal */ }
  },

  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length) await redis.del(...keys);
    } catch { /* non-fatal */ }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
    } catch { /* non-fatal */ }
  },
};
