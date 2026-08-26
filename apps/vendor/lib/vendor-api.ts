import { readSession } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export class VendorApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Server Components only — reads the session cookie and calls the backend with a bearer token. */
export async function vendorFetch<T>(path: string): Promise<T> {
  const session = readSession();
  if (!session) {
    throw new VendorApiError("Not authenticated", 401);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new VendorApiError(body?.error?.message ?? "Request failed", res.status);
  }
  return body.data as T;
}
