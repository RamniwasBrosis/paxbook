import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export async function POST() {
  const refreshRaw = cookies().get(REFRESH_COOKIE)?.value;
  if (refreshRaw) {
    try {
      await fetch(`${API_BASE_URL}/vendor-auth/logout`, {
        method: "POST",
        // A bodyless POST omits Content-Length, which some hosts' WAF rules (e.g.
        // OWASP CRS rule 921160) reject outright — an empty JSON body sidesteps that.
        headers: { Cookie: `paxbook_vendor_refresh_token=${refreshRaw}`, "Content-Type": "application/json" },
        body: "{}",
      });
    } catch {
      // Best-effort revoke — local cookies are cleared regardless below.
    }
  }
  const response = NextResponse.json({ success: true, data: { loggedOut: true } });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
