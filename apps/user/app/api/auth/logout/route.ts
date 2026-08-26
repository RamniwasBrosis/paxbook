import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export async function POST() {
  const refreshRaw = cookies().get(REFRESH_COOKIE)?.value;
  if (refreshRaw) {
    try {
      await fetch(`${API_BASE_URL}/customer-auth/logout`, {
        method: "POST",
        headers: { Cookie: `paxbook_customer_refresh_token=${refreshRaw}` },
      });
    } catch {
      // Best-effort revoke — the local cookies are cleared regardless below.
    }
  }
  const response = NextResponse.json({ success: true, data: { loggedOut: true } });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
