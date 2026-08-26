import { cookies } from "next/headers";

const TENANT_COOKIE = "pb_tenant_slug";

/** Mirrors apps/user/lib/tenant.ts — see that file for why this exists instead of real subdomains locally. */
export function getTenantHeader(): Record<string, string> {
  const slug = cookies().get(TENANT_COOKIE)?.value;
  return slug ? { "X-Tenant-Slug": slug } : {};
}
