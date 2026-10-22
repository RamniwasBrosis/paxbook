import { NextResponse } from "next/server";
import { getTenantHeader } from "@/lib/tenant";
import { forwardedFor } from "@/lib/client-ip";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Passes a public customer-auth call (no session involved) through to the API, keeping the visitor's IP. */
export async function proxyPublicAuth(req: Request, backendPath: string): Promise<NextResponse> {
  const isGet = req.method === "GET";
  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: req.method,
    headers: { "Content-Type": "application/json", ...getTenantHeader(), ...forwardedFor(req) },
    ...(isGet ? {} : { body: await req.text() }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ success: false, error: { message: "Something went wrong. Please try again." } }));
  return NextResponse.json(data, { status: res.status });
}
