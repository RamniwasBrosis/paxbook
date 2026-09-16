import Link from "next/link";
import type { Metadata } from "next";
import type { FlightBookingDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";
import { FlightBookingsStatusTabs, type FlightBookingRow } from "@/components/FlightBookingsStatusTabs";

export const metadata: Metadata = { title: "My Flight Bookings" };

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

  const rows: FlightBookingRow[] = [
    ...standalone.map(
      (b): FlightBookingRow => ({
        key: b.id,
        href: `/account/flight-bookings/${b.id}`,
        route: `${b.depCity} → ${b.arrCity}`,
        subtitle: `${b.onDate} · ${b.pnr ? `PNR ${b.pnr}` : "Booked"} ${new Date(b.createdAt).toLocaleDateString("en-IN")}`,
        status: b.status,
        amount: b.totalAmount,
        currency: b.currency,
        createdAt: b.createdAt,
        travelDate: b.reDate || b.onDate,
        hasDateChangeRequest: Boolean(b.dateChangeRequestedAt),
        isRefunded: Boolean(b.refundedAt),
      }),
    ),
    ...Array.from(byTripId.entries()).map(([tripId, legs]): FlightBookingRow => {
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
        travelDate: returnLeg?.onDate ?? onward.onDate,
        hasDateChangeRequest: legs.some((l) => l.dateChangeRequestedAt),
        isRefunded: legs.some((l) => l.refundedAt),
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
        <FlightBookingsStatusTabs rows={rows} />
      )}
    </div>
  );
}
