import { NextResponse } from "next/server";
import { getTenantHeader } from "@/lib/tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Starts the Google login round-trip: fetches the tenant-specific authorize URL from the API, then sends the browser to Google. */
export async function GET(req: Request) {
  const res = await fetch(`${API_BASE_URL}/customer-auth/google/start`, { headers: getTenantHeader() });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    return NextResponse.redirect(new URL("/login?error=google_login_failed", req.url));
  }
  return NextResponse.redirect(json.data.authorizeUrl as string);
}
