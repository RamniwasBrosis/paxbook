import { BadRequestException } from "@nestjs/common";
import { FtdClientService, tokenTtlSeconds } from "./ftd-client.service";

describe("FTD token cache lifetime", () => {
  it("ends just before midnight India time, not 18 hours later", () => {
    // 22:00 IST = 16:30 UTC → 2h left, minus the 5 min margin
    expect(tokenTtlSeconds(new Date("2026-10-05T16:30:00Z"))).toBe(2 * 3600 - 300);
  });

  it("never exceeds 18 hours early in the day", () => {
    // 00:10 IST
    expect(tokenTtlSeconds(new Date("2026-10-05T18:40:00Z"))).toBe(18 * 3600);
  });

  it("keeps at least a minute right before midnight", () => {
    expect(tokenTtlSeconds(new Date("2026-10-05T18:29:00Z"))).toBe(60);
  });
});

describe("FTD expired token", () => {
  it("makes a new token and retries once", async () => {
    const cache = { getOrSet: jest.fn().mockResolvedValueOnce("old").mockResolvedValueOnce("new"), invalidate: jest.fn() };
    const svc = new FtdClientService({ get: (k: string) => (k === "FTD_MODE" ? "0" : "x") } as never, {} as never, cache as never);
    const call = jest
      .spyOn(svc as unknown as { call: (...a: unknown[]) => Promise<unknown> }, "call")
      .mockRejectedValueOnce(new BadRequestException({ code: "FTD_API_ERROR", message: "Token Expired - Generate and use new Token every day" }))
      .mockResolvedValueOnce({ ok: true });
    await expect(svc.search({})).resolves.toEqual({ ok: true });
    expect(cache.invalidate).toHaveBeenCalledWith("ftd:token:0");
    expect(call).toHaveBeenLastCalledWith("postSearchFlightV3", expect.objectContaining({ headers: { "x-api-key": "new" } }));
  });

  it("also retries when FTD says the token is no longer authorised", async () => {
    const cache = { getOrSet: jest.fn().mockResolvedValueOnce("old").mockResolvedValueOnce("new"), invalidate: jest.fn() };
    const svc = new FtdClientService({ get: (k: string) => (k === "FTD_MODE" ? "0" : "x") } as never, {} as never, cache as never);
    jest
      .spyOn(svc as unknown as { call: (...a: unknown[]) => Promise<unknown> }, "call")
      .mockRejectedValueOnce(new BadRequestException({ code: "FTD_API_ERROR", message: "Invalid or no Authorization" }))
      .mockResolvedValueOnce({ ok: true });
    await expect(svc.fareDetails(1, "r")).resolves.toEqual({ ok: true });
    expect(cache.invalidate).toHaveBeenCalledTimes(1);
  });

  it("does not retry other errors", async () => {
    const cache = { getOrSet: jest.fn().mockResolvedValue("tok"), invalidate: jest.fn() };
    const svc = new FtdClientService({ get: (k: string) => (k === "FTD_MODE" ? "0" : "x") } as never, {} as never, cache as never);
    jest
      .spyOn(svc as unknown as { call: (...a: unknown[]) => Promise<unknown> }, "call")
      .mockRejectedValue(new BadRequestException({ code: "FTD_API_ERROR", message: "No flights found" }));
    await expect(svc.search({})).rejects.toBeInstanceOf(BadRequestException);
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
