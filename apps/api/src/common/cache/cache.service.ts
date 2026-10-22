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

  /** Short-lived single-use values (captcha answers). Falls back to process memory without Redis. */
  private readonly memory = new Map<string, { value: string; expiresAt: number }>();

  async putOnce(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.client && this.client.status === "ready") {
      try {
        await this.client.set(key, value, "EX", ttlSeconds);
        return;
      } catch {
        // fall through to memory
      }
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    if (this.memory.size > 5000) for (const [k, v] of this.memory) if (v.expiresAt < Date.now()) this.memory.delete(k);
  }

  /** Reads and deletes in one step, so the same value can never be used twice. */
  async takeOnce(key: string): Promise<string | null> {
    if (this.client && this.client.status === "ready") {
      try {
        // GET + DEL in one MULTI (atomic): the live server runs Redis 3.2, which has no GETDEL.
        const results = await this.client.multi().get(key).del(key).exec();
        const value = results?.[0]?.[1];
        if (typeof value === "string") return value;
      } catch {
        // fall through to memory
      }
    }
    const entry = this.memory.get(key);
    this.memory.delete(key);
    return entry && entry.expiresAt > Date.now() ? entry.value : null;
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
