import Link from "next/link";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import type { BookingSummaryDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";

export const metadata: Metadata = { title: "My Trips" };

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function MyBookingsPage() {
  const bookings = await customerFetch<BookingSummaryDto[]>("/customer/bookings");

  return (
    <div>
      <p className="eyebrow">Booking history</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">My Trips</h1>
      <p className="mt-1 text-sm text-slate-500">Status and details for every trip you&apos;ve booked with us.</p>

      {bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">
          No bookings yet. <Link href="/packages" className="font-semibold text-brand hover:underline">Explore packages</Link> to get started.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/account/bookings/${b.id}`} className="flat-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-navy-deep">{b.packageTitle}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  {b.travelStartDate ? new Date(b.travelStartDate).toLocaleDateString("en-IN") : "Dates not set"} · Booked{" "}
                  {new Date(b.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[b.status] ?? "bg-slate-100 text-slate-600"}`}>{b.status}</span>
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
