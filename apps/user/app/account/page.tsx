import Link from "next/link";
import type { Metadata } from "next";
import { Luggage, Bell, Compass, Calendar, ArrowRight } from "lucide-react";
import type { BookingSummaryDto, CustomerProfileDto, NotificationDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";

export const metadata: Metadata = { title: "My Account" };

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-50 text-red-700",
};
const STATUS_LABEL: Record<string, string> = { DRAFT: "Awaiting payment", CONFIRMED: "Confirmed", COMPLETED: "Completed", CANCELLED: "Cancelled" };

export default async function AccountOverviewPage() {
  const [profile, bookings, notifications] = await Promise.all([
    customerFetch<CustomerProfileDto>("/customer/profile"),
    customerFetch<BookingSummaryDto[]>("/customer/bookings"),
    customerFetch<NotificationDto[]>("/customer/notifications"),
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const upcoming = bookings
    .filter((b) => b.status === "CONFIRMED" && b.travelStartDate && new Date(b.travelStartDate) >= new Date())
    .sort((a, b) => new Date(a.travelStartDate!).getTime() - new Date(b.travelStartDate!).getTime())[0];
  const recentBookings = bookings.filter((b) => b.id !== upcoming?.id).slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">{profile.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your trips.</p>
      </div>

      {upcoming ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-deep via-brand to-navy-deep p-6 text-white sm:p-8">
          <p className="eyebrow on-dark-muted">Your next trip</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">{upcoming.packageTitle}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm on-dark-muted">
            {upcoming.travelStartDate ? (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" strokeWidth={2} />
                {new Date(upcoming.travelStartDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {upcoming.travelEndDate ? ` – ${new Date(upcoming.travelEndDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
              </span>
            ) : null}
            <span className="font-bold text-white">
              {upcoming.currency} {upcoming.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <Link
            href={`/account/bookings/${upcoming.id}`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
          >
            View trip details
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flat-card p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist-strong text-brand">
            <Luggage className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="mt-3 text-xs text-slate-400">Total bookings</p>
          <p className="mt-0.5 text-2xl font-bold text-navy-deep">{bookings.length}</p>
        </div>
        <div className="flat-card p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist-strong text-brand">
            <Bell className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="mt-3 text-xs text-slate-400">Unread notifications</p>
          <p className="mt-0.5 text-2xl font-bold text-navy-deep">{unreadCount}</p>
        </div>
        <Link href="/packages" className="flat-card flex flex-col justify-between p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 text-accent-dark">
            <Compass className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="mt-3 flex items-center gap-1 text-sm font-bold text-brand">
            Browse packages
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-navy-deep">Recent trips</h2>
          <Link href="/account/bookings" className="text-sm font-semibold text-brand hover:underline">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="rounded-2xl bg-mist p-6 text-sm text-slate-500">
            No bookings yet. <Link href="/packages" className="font-semibold text-brand hover:underline">Explore packages</Link> to plan your first trip.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentBookings.map((b) => (
              <Link key={b.id} href={`/account/bookings/${b.id}`} className="flat-card flex items-center justify-between p-4">
                <div>
                  <p className="font-bold text-navy-deep">{b.packageTitle}</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONE[b.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
                <p className="font-bold text-navy-deep">
                  {b.currency} {b.totalAmount.toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
