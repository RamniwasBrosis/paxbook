import { getClientTenantHeader } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/**
 * Booking calls for both checkout modes: a logged-in customer goes through the site's /api/customer
 * proxy (session cookie); a guest calls the API's guest endpoints with the booking's own guest token.
 */
export type CheckoutKind = "booking" | "trip";

async function send<T>(url: string, init: { method: string; body?: unknown; guestToken?: string | null; direct: boolean }): Promise<T> {
  const res = await fetch(url, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      ...(init.direct ? getClientTenantHeader() : {}),
      ...(init.guestToken ? { "x-guest-token": init.guestToken } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json?.error?.message ?? "Something went wrong. Please try again.");
  return json.data as T;
}

/**
 * Creates the draft; returns its id (booking id or trip id), what the server will charge (it prices
 * the fare again with the airline) and, for a guest, the token for it.
 */
export async function createDraft(kind: CheckoutKind, payload: unknown, asGuest: boolean): Promise<{ id: string; total: number; guestToken: string | null }> {
  if (asGuest) {
    const data = await send<{ booking?: { id: string; totalAmount: number }; trip?: { tripId: string; totalAmount: number }; guestToken: string }>(
      `${API_BASE_URL}/public/flights/guest/${kind === "trip" ? "trips" : "bookings"}`,
      { method: "POST", body: payload, direct: true },
    );
    return kind === "trip"
      ? { id: data.trip!.tripId, total: data.trip!.totalAmount, guestToken: data.guestToken }
      : { id: data.booking!.id, total: data.booking!.totalAmount, guestToken: data.guestToken };
  }
  const data = await send<{ id?: string; tripId?: string; totalAmount: number }>(kind === "trip" ? "/api/customer/flight-bookings/round-trip" : "/api/customer/flight-bookings", {
    method: "POST",
    body: payload,
    direct: false,
  });
  return { id: kind === "trip" ? data.tripId! : data.id!, total: data.totalAmount, guestToken: null };
}

/** True when the airline's fresh price differs from what the customer was shown (beyond rounding). */
export function fareChanged(shown: number, charged: number): boolean {
  return Math.abs(shown - charged) >= 1;
}

export function createPaymentOrder<T>(kind: CheckoutKind, id: string, guestToken: string | null): Promise<T> {
  const path = kind === "trip" ? `trips/${id}` : `bookings/${id}`;
  return guestToken
    ? send<T>(`${API_BASE_URL}/public/flights/guest/${path}/payment/order`, { method: "POST", guestToken, direct: true })
    : send<T>(kind === "trip" ? `/api/customer/flight-trips/${id}/payment/order` : `/api/customer/flight-bookings/${id}/payment/order`, { method: "POST", direct: false });
}

export function verifyPayment(kind: CheckoutKind, id: string, paymentId: string | null, body: Record<string, unknown>, guestToken: string | null): Promise<unknown> {
  const suffix = kind === "trip" ? "payment/verify" : `payment/${paymentId}/verify`;
  return guestToken
    ? send(`${API_BASE_URL}/public/flights/guest/${kind === "trip" ? "trips" : "bookings"}/${id}/${suffix}`, { method: "POST", body, guestToken, direct: true })
    : send(kind === "trip" ? `/api/customer/flight-trips/${id}/${suffix}` : `/api/customer/flight-bookings/${id}/${suffix}`, { method: "POST", body, direct: false });
}

/** Where to land after paying: My Account for customers, the token-protected page for guests. */
export function confirmationUrl(kind: CheckoutKind, id: string, guestToken: string | null): string {
  if (guestToken) return `/flights/booking/${kind === "trip" ? "trip/" : ""}${id}?t=${encodeURIComponent(guestToken)}&justBooked=1`;
  return kind === "trip" ? `/account/flight-bookings/trip/${id}?justBooked=1` : `/account/flight-bookings/${id}?justBooked=1`;
}

export function fetchGuest<T>(kind: CheckoutKind, id: string, guestToken: string): Promise<T> {
  return send<T>(`${API_BASE_URL}/public/flights/guest/${kind === "trip" ? "trips" : "bookings"}/${id}`, { method: "GET", guestToken, direct: true });
}
