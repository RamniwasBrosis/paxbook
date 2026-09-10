import Link from "next/link";
import type { Metadata } from "next";
import { Plane } from "lucide-react";
import type { FlightBookingDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";

export const metadata: Metadata = { title: "My Flight Bookings" };

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PENDING_CONFIRMATION: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLATION_PENDING: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
};

interface Row {
  key: string;
  href: string;
  route: string;
  subtitle: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export default async function MyFlightBookingsPage() {
  const bookings = await customerFetch<FlightBookingDto[]>("/customer/flight-bookings");

  // A round trip is two linked bookings sharing a tripId — collapse them into one row (routed to the
  // combined trip page) rather than showing the return leg as if it were an unrelated booking.
  const byTripId = new Map<string, FlightBookingDto[]>();
  const standalone: FlightBookingDto[] = [];
  for (const b of bookings) {
    if (b.tripId) {
      const group = byTripId.get(b.tripId) ?? [];
      group.push(b);
      byTripId.set(b.tripId, group);
    } else {
      standalone.push(b);
    }
  }

  const rows: Row[] = [
    ...standalone.map((b): Row => ({
      key: b.id,
      href: `/account/flight-bookings/${b.id}`,
      route: `${b.depCity} → ${b.arrCity}`,
      subtitle: `${b.onDate} · ${b.pnr ? `PNR ${b.pnr}` : "Booked"} ${new Date(b.createdAt).toLocaleDateString("en-IN")}`,
      status: b.status,
      amount: b.totalAmount,
      currency: b.currency,
      createdAt: b.createdAt,
    })),
    ...Array.from(byTripId.entries()).map(([tripId, legs]): Row => {
      const onward = legs.find((l) => l.tripRole === "ONWARD") ?? legs[0]!;
      const returnLeg = legs.find((l) => l.tripRole === "RETURN");
      const amount = legs.reduce((sum, l) => sum + l.totalAmount, 0);
      const statuses = new Set(legs.map((l) => l.status));
      const combinedStatus = statuses.size === 1 ? onward.status : "PENDING_CONFIRMATION";
      return {
        key: tripId,
        href: `/account/flight-bookings/trip/${tripId}`,
        route: `${onward.depCity} ⇄ ${onward.arrCity}`,
        subtitle: `${onward.onDate}${returnLeg ? ` – ${returnLeg.onDate}` : ""} · Round trip · ${new Date(onward.createdAt).toLocaleDateString("en-IN")}`,
        status: combinedStatus,
        amount,
        currency: onward.currency,
        createdAt: onward.createdAt,
      };
    }),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <p className="eyebrow">Booking history</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">My Flight Bookings</h1>
      <p className="mt-1 text-sm text-slate-500">Status, PNR and ticket details for every flight you&apos;ve booked with us.</p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">
          No flight bookings yet.{" "}
          <Link href="/flights" className="font-semibold text-brand hover:underline">
            Search flights
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((r) => (
            <Link key={r.key} href={r.href} className="flat-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                  <Plane className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-navy-deep">{r.route}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{r.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[r.status] ?? "bg-slate-100 text-slate-600"}`}>{r.status.replace(/_/g, " ")}</span>
                <span className="font-bold text-navy-deep">
                  {r.currency} {r.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
