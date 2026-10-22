/**
 * The visitor's IP as seen by this server, to pass on when the site's server calls the API for them
 * (otherwise the API would see only this server and rate-limit every visitor together). Walks the
 * X-Forwarded-For chain from the right, skipping this machine's own proxy hops.
 */
const OWN_HOPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1", ...(process.env.TRUSTED_PROXY_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean)]);

export function clientIp(req: Request): string | null {
  const chain = (req.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (let i = chain.length - 1; i >= 0; i--) {
    if (!OWN_HOPS.has(chain[i]!)) return chain[i]!;
  }
  return req.headers.get("x-real-ip");
}

export function forwardedFor(req: Request): Record<string, string> {
  const ip = clientIp(req);
  return ip ? { "X-Forwarded-For": ip } : {};
}
