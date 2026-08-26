import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

/**
 * Thin read-through cache for expensive, frequently-hit PUBLIC endpoints (homepage, destination/package
 * lists) — a real Redis connection when REDIS_URL is set, and a silent, always-empty no-op when it isn't.
 * TTL-only, no manual invalidation: an admin's edit is visible within `ttlSeconds` rather than instantly,
 * which is the right trade for read-heavy public traffic and avoids threading cache-busting through every
 * admin write path.
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

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
