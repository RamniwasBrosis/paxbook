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
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function MyFlightBookingsPage() {
  const bookings = await customerFetch<FlightBookingDto[]>("/customer/flight-bookings");

  return (
    <div>
      <p className="eyebrow">Booking history</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">My Flight Bookings</h1>
      <p className="mt-1 text-sm text-slate-500">Status, PNR and ticket details for every flight you&apos;ve booked with us.</p>

      {bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">
          No flight bookings yet.{" "}
          <Link href="/flights" className="font-semibold text-brand hover:underline">
            Search flights
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/account/flight-bookings/${b.id}`} className="flat-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                  <Plane className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-navy-deep">
                    {b.depCity} → {b.arrCity}
                    {b.reDate ? " (round trip)" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {b.onDate} · {b.pnr ? `PNR ${b.pnr}` : "Booked"} {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[b.status] ?? "bg-slate-100 text-slate-600"}`}>{b.status.replace(/_/g, " ")}</span>
                <span className="font-bold text-navy-deep">
                  {b.currency} {b.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
