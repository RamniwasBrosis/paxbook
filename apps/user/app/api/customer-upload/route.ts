import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Multipart file upload needs its own route — the generic /api/customer/* proxy assumes a JSON body. */
export async function POST(req: NextRequest) {
  const session = readSession();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "NOT_AUTHENTICATED", message: "Please log in." } }, { status: 401 });
  }

  const formData = await req.formData();
  const res = await fetch(`${API_BASE_URL}/customer/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
