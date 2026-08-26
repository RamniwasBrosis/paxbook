import { NextResponse } from "next/server";
import { SESSION_COOKIE, REFRESH_COOKIE, SESSION_COOKIE_OPTIONS, type CustomerSession } from "@/lib/session";

/** Receives the token handoff from the API's Google OAuth callback and establishes the same cookie session used everywhere else. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const accessToken = url.searchParams.get("accessToken");
  const accessTokenExpiresAt = url.searchParams.get("accessTokenExpiresAt");
  const refreshToken = url.searchParams.get("refreshToken");
  const customerB64 = url.searchParams.get("customer");

  if (!accessToken || !accessTokenExpiresAt || !refreshToken || !customerB64) {
    return NextResponse.redirect(new URL("/login?error=google_login_failed", req.url));
  }

  const customer = JSON.parse(Buffer.from(customerB64, "base64url").toString("utf8"));
  const session: CustomerSession = { accessToken, accessTokenExpiresAt, customer };

  const response = NextResponse.redirect(new URL("/account", req.url));
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), SESSION_COOKIE_OPTIONS);
  response.cookies.set(REFRESH_COOKIE, refreshToken, SESSION_COOKIE_OPTIONS);
  return response;
}
