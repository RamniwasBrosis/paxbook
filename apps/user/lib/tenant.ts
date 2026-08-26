import { cookies } from "next/headers";

const TENANT_COOKIE = "pb_tenant_slug";

/**
 * In production a reverse proxy sets X-Tenant-Slug from the real subdomain. This dev
 * environment has no wildcard DNS, so `?tenant=<slug>` (handled in middleware.ts) sets a
 * cookie that stands in for that header — same downstream code path either way.
 */
export function getTenantHeader(): Record<string, string> {
  const slug = cookies().get(TENANT_COOKIE)?.value;
  return slug ? { "X-Tenant-Slug": slug } : {};
}
