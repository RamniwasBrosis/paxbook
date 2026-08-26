import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Generic authenticated JSON proxy for client components: /api/vendor/* -> {API}/vendor/*, bearer token attached server-side. */
async function handle(req: NextRequest, path: string[]) {
  const session = readSession();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "NOT_AUTHENTICATED", message: "Please log in." } }, { status: 401 });
  }

  const search = req.nextUrl.search;
  const backendUrl = `${API_BASE_URL}/vendor/${path.join("/")}${search}`;
  const hasBody = req.method !== "GET" && req.method !== "DELETE";

  const res = await fetch(backendUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params.path);
}
