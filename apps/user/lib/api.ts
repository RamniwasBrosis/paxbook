import { getTenantHeader } from "./tenant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

/**
 * Server-side fetch against the public (unauthenticated) API surface. No Next.js fetch-cache here —
 * the backend already caches these endpoints (Redis, with explicit invalidation on admin writes), so a
 * second, uncoordinated cache layer on top only reintroduces staleness that can't be invalidated in sync.
 */
export async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getTenantHeader(), cache: "no-store" });
  const json = (await res.json()) as ApiSuccess<T> | ApiError;
  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}

/** Same as publicFetch but returns null on 404 instead of throwing — for Next's notFound() pages. */
export async function publicFetchOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getTenantHeader(), cache: "no-store" });
  if (res.status === 404) return null;
  const json = (await res.json()) as ApiSuccess<T> | ApiError;
  if (!json.success) {
    if (res.status === 404) return null;
    throw new Error(json.error.message);
  }
  return json.data;
}
