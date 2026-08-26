import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTenantHeader } from "./tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const SESSION_COOKIE = "pb_customer_session";
export const REFRESH_COOKIE = "pb_customer_refresh";
const REFRESH_BACKEND_COOKIE = "paxbook_customer_refresh_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export interface CustomerSessionCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface CustomerSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  customer: CustomerSessionCustomer;
}

/** Server Components / Route Handlers only — reads the session set by the auth route handlers or middleware's silent refresh. */
export function readSession(): CustomerSession | null {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

/**
 * Calls a customer-auth endpoint that issues tokens (otp/verify, register, login) and mirrors the
 * backend's httpOnly refresh cookie into our own domain's httpOnly cookie, since the browser never
 * talks to the API's origin directly — everything customer-facing is proxied through this BFF.
 */
export async function proxyAuthAndEstablishSession(backendPath: string, payload: unknown): Promise<NextResponse> {
  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getTenantHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });

  if (res.ok && data.success !== false) {
    const setCookieHeaders = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    const rawRefresh = extractCookieValue(setCookieHeaders, REFRESH_BACKEND_COOKIE);
    const session: CustomerSession = {
      accessToken: data.data.accessToken,
      accessTokenExpiresAt: data.data.accessTokenExpiresAt,
      customer: data.data.customer,
    };
    response.cookies.set(SESSION_COOKIE, JSON.stringify(session), SESSION_COOKIE_OPTIONS);
    if (rawRefresh) {
      response.cookies.set(REFRESH_COOKIE, rawRefresh, SESSION_COOKIE_OPTIONS);
    }
  }

  return response;
}

function extractCookieValue(setCookieHeaders: string[], name: string): string | null {
  for (const header of setCookieHeaders) {
    if (header.startsWith(`${name}=`)) {
      return header.slice(name.length + 1).split(";")[0] ?? null;
    }
  }
  return null;
}
