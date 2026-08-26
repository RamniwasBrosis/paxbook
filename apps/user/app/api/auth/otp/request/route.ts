import { NextResponse } from "next/server";
import { getTenantHeader } from "@/lib/tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export async function POST(req: Request) {
  const payload = await req.json();
  const res = await fetch(`${API_BASE_URL}/customer-auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getTenantHeader() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
