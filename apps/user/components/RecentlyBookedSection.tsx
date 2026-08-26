import Link from "next/link";
import { Heart } from "lucide-react";
import type { RecentBookingDto, PublicStatsDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { MarqueeRow } from "@/components/MarqueeRow";

const MIN_BOOKINGS_TO_SHOW = 3;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function RecentlyBookedSection({ bookings, stats }: { bookings: RecentBookingDto[]; stats: PublicStatsDto }) {
  if (bookings.length < MIN_BOOKINGS_TO_SHOW) return null;

  return (
    <section className="shell py-16 lg:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Live from our travellers" title="Recently Booked Itineraries" />
        <span className="mb-10 flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
          <Heart className="h-4 w-4" strokeWidth={2} fill="currentColor" />
          {stats.tripsBookedCount}+ trips booked
        </span>
      </div>
      <MarqueeRow durationSeconds={bookings.length * 6}>
        {bookings.map((b) => (
          <Link
            key={b.id}
            href={`/packages/${b.packageSlug}`}
            className="w-80 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
          >
            <div className="relative h-40 w-full">
              {b.coverImageUrl ? (
                <img src={b.coverImageUrl} alt={b.packageTitle} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-light to-white" />
              )}
              <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-3">
                <InitialsAvatar name={b.customerFirstName} size={28} />
                <p className="text-xs font-semibold text-white">
                  {b.customerFirstName} · <span className="font-normal text-white/80">{timeAgo(b.bookedAt)}</span>
                </p>
              </div>
            </div>
            <div className="p-5">
              {b.categoryName ? (
                <span className="mb-2 inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {b.categoryName}
                </span>
              ) : null}
              <h3 className="font-bold tracking-tight text-slate-900">{b.packageTitle}</h3>
              <p className="text-sm text-slate-500">
                {b.destinationName} · {b.durationNights}N
              </p>
              <div className="mt-3 flex items-baseline justify-between border-t border-slate-50 pt-3">
                <span className="text-xs text-slate-400">Per person</span>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">₹{b.price.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </Link>
        ))}
      </MarqueeRow>
    </section>
  );
}
