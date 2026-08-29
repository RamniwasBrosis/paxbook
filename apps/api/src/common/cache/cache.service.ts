import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

/**
 * Thin read-through cache for expensive, frequently-hit PUBLIC endpoints (homepage, destination/package
 * lists) — a real Redis connection when REDIS_URL is set, and a silent, always-empty no-op when it isn't.
 * TTL is a safety-net upper bound only; admin write paths that affect a cached key call `invalidate()`
 * so edits are visible immediately rather than waiting out the TTL.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>("REDIS_URL");
    this.client = url ? new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null;
    this.client?.connect().catch((err) => this.logger.warn(`Redis unavailable, caching disabled: ${(err as Error).message}`));
  }

  async getOrSet<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
    if (!this.client || this.client.status !== "ready") return load();

    try {
      const cached = await this.client.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // cache read failure is never fatal — fall through to a live load
    }

    const value = await load();
    this.client.set(key, JSON.stringify(value), "EX", ttlSeconds).catch(() => {});
    return value;
  }

  /** Explicit invalidation for the handful of admin-write paths where a 60s-stale homepage/listing is unacceptable. */
  async invalidate(key: string | string[]): Promise<void> {
    if (!this.client || this.client.status !== "ready") return;
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length === 0) return;
    await this.client.del(...keys).catch(() => {});
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
