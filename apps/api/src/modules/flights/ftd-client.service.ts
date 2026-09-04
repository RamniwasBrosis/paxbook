import { Injectable, Logger, BadGatewayException, BadRequestException, GatewayTimeoutException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CacheService } from "../../common/cache/cache.service";

const REQUEST_TIMEOUT_MS = 20_000;
/** FTD tokens are valid "for the entire day" and capped at 25/day — cache well under that. */
const TOKEN_CACHE_TTL_SECONDS = 60 * 60 * 18;

export class FtdApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

interface FtdCallOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  /** Skip the x-api-key/apikey auth header injection (only postCreateToken doesn't need a token). */
  authHeaderName?: "x-api-key" | "apikey" | null;
}

/**
 * Thin, faithful wrapper around the FTD Travel Air API (see FTD Travel Air API-V2.6.pdf). Two
 * different auth schemes are in play: search/fare/price/seats/fare-rules/balance/statement use
 * `x-api-key: <daily token>`; book/cancel/reissue/booking-status use `apikey: <raw account key>`
 * directly. Every call is logged to FlightApiLog for the admin-facing live/debug view.
 */
@Injectable()
export class FtdClientService {
  private readonly logger = new Logger(FtdClientService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private get baseUrl(): string {
    return (this.configService.get<string>("FTD_BASE_URL") ?? "").replace(/\/+$/, "") + "/";
  }

  private get mode(): number {
    return Number(this.configService.get<string>("FTD_MODE") ?? "0");
  }

  private get rawApiKey(): string {
    const key = this.mode === 1 ? this.configService.get<string>("FTD_API_KEY_LIVE") : this.configService.get<string>("FTD_API_KEY_TEST");
    if (!key) throw new FtdApiError("FTD API key is not configured for this mode.", "FTD_NOT_CONFIGURED");
    return key;
  }

  async isConfigured(): Promise<boolean> {
    try {
      return Boolean(this.baseUrl && this.configService.get<string>("FTD_AGENT_ID") && this.rawApiKey);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  private async getToken(): Promise<string> {
    const cacheKey = `ftd:token:${this.mode}`;
    return this.cache.getOrSet(cacheKey, TOKEN_CACHE_TTL_SECONDS, () => this.createToken());
  }

  private async createToken(): Promise<string> {
    const agentid = this.configService.get<string>("FTD_AGENT_ID") ?? "";
    const username = this.configService.get<string>("FTD_USERNAME") ?? "";
    const password = this.configService.get<string>("FTD_PASSWORD") ?? "";
    const data = await this.call<{ code: string; data?: string; error_msg?: string }>("postCreateToken", {
      method: "GET",
      authHeaderName: null,
      headers: { agentid, username, password, Mode: String(this.mode), apikey: this.rawApiKey },
    });
    if (data.code !== "success" || !data.data) {
      throw new FtdApiError(data.error_msg ?? "Could not authenticate with the flight provider.", "FTD_AUTH_FAILED");
    }
    return data.data;
  }

  // ---------------------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------------------

  async search(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("postSearchFlightV3", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body });
  }

  async fareDetails(flightID: number, refID: string): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("postFareDetails", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body: { flightID, refID } });
  }

  async priceCheck(flightID: number, refID: string): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("postPriceVerify", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body: { flightID, refID } });
  }

  async fareRules(flightID: number): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("postFareRules", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body: { flightID } });
  }

  async seats(flightID: number, refID: string, passenger: Array<Record<string, unknown>>): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("seats", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body: { flightID, refID, passenger } });
  }

  async balance(): Promise<{ balance: string }> {
    const token = await this.getToken();
    return this.call("balance", { method: "GET", authHeaderName: "x-api-key", headers: { "x-api-key": token } });
  }

  async statement(date: string): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    return this.call("statement", { method: "POST", authHeaderName: "x-api-key", headers: { "x-api-key": token }, body: { date } });
  }

  /** Book/Cancel/Reissue/Booking Status use the raw API key directly, not the daily token. */
  async book(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call("bookFlight", { method: "POST", authHeaderName: "apikey", headers: { apikey: this.rawApiKey }, body: payload });
  }

  async bookingStatus(refID: string): Promise<Record<string, unknown>> {
    return this.call("bookingStatus", { method: "POST", authHeaderName: "apikey", headers: { apikey: this.rawApiKey }, body: { refID } });
  }

  async cancel(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call("cancelFlight", { method: "POST", authHeaderName: "apikey", headers: { apikey: this.rawApiKey }, body: payload });
  }

  async reschedule(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call("reschedule", { method: "POST", authHeaderName: "apikey", headers: { apikey: this.rawApiKey }, body: payload });
  }

  // ---------------------------------------------------------------------------
  // Transport
  // ---------------------------------------------------------------------------

  /**
   * The provider's test server occasionally leaks a PHP notice/warning as HTML *before* the JSON
   * payload (e.g. a `session_start()` permissions warning) — the response is otherwise entirely
   * valid, but `JSON.parse` fails outright on the combined text. Since real bookings (with a real
   * PNR) have been silently treated as failures because of this, strip any such leading garbage up
   * to the first `{` or `[` before giving up and falling back to `{ raw: text }`.
   */
  private parseFtdResponse(text: string, endpoint: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      const jsonStart = text.search(/[[{]/);
      if (jsonStart > 0) {
        try {
          const recovered = JSON.parse(text.slice(jsonStart));
          this.logger.warn(`FTD ${endpoint} response had ${jsonStart} bytes of non-JSON content before valid JSON — recovered.`);
          return recovered;
        } catch {
          // fall through
        }
      }
      return { raw: text };
    }
  }

  private async call<T = Record<string, unknown>>(endpoint: string, options: FtdCallOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method ?? "POST";
    // Some callers (createToken) already set their own "Mode" header — fetch's Headers merges
    // same-name headers case-insensitively via append(), so adding a second "mode" here would
    // produce "Mode: 0, 0" and the provider rejects that as an invalid mode.
    const hasModeHeader = Object.keys(options.headers ?? {}).some((k) => k.toLowerCase() === "mode");
    const headers: Record<string, string> = { ...options.headers, ...(hasModeHeader ? {} : { mode: String(this.mode) }) };
    if (method === "POST") headers["Content-Type"] = "application/json";

    const startedAt = Date.now();
    let statusCode: number | null = null;
    let responseBody: unknown = null;
    let success = false;
    let errorMessage: string | null = null;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      statusCode = res.status;
      const text = await res.text();
      responseBody = this.parseFtdResponse(text, endpoint);

      if (!res.ok) {
        const msg = (responseBody as { error_msg?: string })?.error_msg ?? `Flight provider returned HTTP ${res.status}.`;
        errorMessage = msg;
        throw new FtdApiError(msg, "FTD_HTTP_ERROR");
      }
      if (responseBody && typeof responseBody === "object" && (responseBody as { code?: string }).code === "error") {
        const msg = (responseBody as { error_msg?: string }).error_msg ?? "Flight provider returned an error.";
        errorMessage = msg;
        throw new FtdApiError(msg, "FTD_API_ERROR");
      }

      success = true;
      return responseBody as T;
    } catch (err) {
      // FtdApiError carries the provider's own message (e.g. "Flight Id not found", "Valid Onward Date
      // Missing") — these are almost always about stale/invalid input (an expired search, a reused
      // flightID), not a server fault, so surface them as 400s instead of letting them fall through
      // to AllExceptionsFilter's generic 500 (FtdApiError extends plain Error, not HttpException).
      if (err instanceof FtdApiError) throw new BadRequestException({ code: err.code, message: err.message });
      if (err instanceof Error && err.name === "TimeoutError") {
        errorMessage = "Flight provider did not respond in time.";
        this.logger.warn(`FTD ${endpoint} timed out after ${REQUEST_TIMEOUT_MS}ms`);
        throw new GatewayTimeoutException({ code: "FTD_TIMEOUT", message: errorMessage });
      }
      errorMessage = err instanceof Error ? err.message : "Could not reach the flight provider.";
      this.logger.error(`FTD ${endpoint} failed: ${errorMessage}`);
      throw new BadGatewayException({ code: "FTD_UNREACHABLE", message: "Could not reach the flight provider. Please try again." });
    } finally {
      const durationMs = Date.now() - startedAt;
      this.prisma.flightApiLog
        .create({
          data: {
            endpoint,
            requestBody: (options.body ?? {}) as object,
            responseBody: (responseBody ?? {}) as object,
            statusCode,
            success,
            errorMessage,
            durationMs,
          },
        })
        .catch((logErr) => this.logger.warn(`Failed to write FlightApiLog for ${endpoint}: ${(logErr as Error).message}`));
    }
  }
}
