import Link from "next/link";
import type { RecentBookingDto } from "@paxbook/types";

function ago(iso: string, now: number): string {
  const mins = Math.max(1, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

/**
 * Running strip of real recent package bookings (confirmed/completed, first name only) under
 * "Are you a?". Hidden when there are none.
 */
export function RecentBookingsMarquee({ bookings }: { bookings: RecentBookingDto[] }) {
  if (bookings.length === 0) return null;
  const now = Date.now();
  // Repeat short lists so one copy is wider than the screen; the second copy makes the loop seamless.
  const row = Array.from({ length: Math.ceil(8 / bookings.length) }, () => bookings).flat();

  return (
    <section aria-label="Recently booked" className="relative flex items-center overflow-hidden border-y border-slate-100 bg-white py-3">
      <span className="relative z-10 ml-4 flex shrink-0 items-center gap-2 rounded-full bg-navy-deep px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-white shadow-card sm:ml-8">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        Recently booked
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max motion-safe:animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
              {row.map((b, i) => (
                <li key={`${b.id}-${i}`} className="px-3">
                  <Link
                    href={`/packages/${b.packageSlug}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="flex items-center gap-3 whitespace-nowrap rounded-full border border-slate-200 bg-mist py-1.5 pl-1.5 pr-5 text-sm text-ink-muted transition-colors hover:border-navy-deep"
                  >
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-light">
                      {b.coverImageUrl ? <img src={b.coverImageUrl} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span>
                      <strong className="font-bold text-navy-deep">{b.customerFirstName}</strong> booked{" "}
                      <strong className="font-bold text-navy-deep">{b.packageTitle}</strong>
                      <span className="text-ink-muted"> · {b.durationNights}N · {ago(b.bookedAt, now)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
