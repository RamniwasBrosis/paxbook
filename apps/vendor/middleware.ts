import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "pb_vendor_session";
const REFRESH_COOKIE = "pb_vendor_refresh";
const REFRESH_BACKEND_COOKIE = "paxbook_vendor_refresh_token";
const TENANT_COOKIE = "pb_tenant_slug";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const COOKIE_OPTIONS = { httpOnly: true as const, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };
const TENANT_COOKIE_OPTIONS = { sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

interface SessionCookieValue {
  accessToken: string;
  accessTokenExpiresAt: string;
  vendor: { id: string; name: string; email: string | null; categoryType: string; tenantId: string };
}

/** Silently refreshes near-expiry vendor sessions (mirrors apps/user/middleware.ts) and gates everything except /login. */
export async function middleware(req: NextRequest) {
  const sessionRaw = req.cookies.get(SESSION_COOKIE)?.value;
  const refreshRaw = req.cookies.get(REFRESH_COOKIE)?.value;

  let session: SessionCookieValue | null = null;
  try {
    session = sessionRaw ? (JSON.parse(sessionRaw) as SessionCookieValue) : null;
  } catch {
    session = null;
  }

  const needsRefresh = Boolean(refreshRaw) && (!session || new Date(session.accessTokenExpiresAt).getTime() - Date.now() < 60_000);

  const response = NextResponse.next();

  const tenantParam = req.nextUrl.searchParams.get("tenant");
  if (tenantParam) {
    response.cookies.set(TENANT_COOKIE, tenantParam, TENANT_COOKIE_OPTIONS);
  }

  if (needsRefresh && refreshRaw) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor-auth/refresh`, {
        method: "POST",
        headers: { Cookie: `${REFRESH_BACKEND_COOKIE}=${refreshRaw}` },
      });
      if (res.ok) {
        const body = await res.json();
        const setCookieHeaders = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
        const newRefresh = extractCookieValue(setCookieHeaders, REFRESH_BACKEND_COOKIE);
        const newSession: SessionCookieValue = {
          accessToken: body.data.accessToken,
          accessTokenExpiresAt: body.data.accessTokenExpiresAt,
          vendor: body.data.vendor,
        };
        response.cookies.set(SESSION_COOKIE, JSON.stringify(newSession), COOKIE_OPTIONS);
        if (newRefresh) {
          response.cookies.set(REFRESH_COOKIE, newRefresh, COOKIE_OPTIONS);
        }
        session = newSession;
      } else {
        response.cookies.delete(SESSION_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
        session = null;
      }
    } catch {
      // Backend unreachable — fall through with whatever session we already had.
    }
  }

  if (req.nextUrl.pathname !== "/login" && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
