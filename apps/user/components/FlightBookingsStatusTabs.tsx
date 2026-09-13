"use client";

import * as React from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import { fromYyyymmdd } from "@/lib/flights";

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PENDING_CONFIRMATION: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLATION_PENDING: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export interface FlightBookingRow {
  key: string;
  href: string;
  route: string;
  subtitle: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  /** Latest travel date across the booking (return date for a round trip, else the outbound date)
   * — used only to bucket a CONFIRMED booking into Upcoming vs Completed; YYYYMMDD, FTD's format. */
  travelDate: string;
}

type StatusTab = "upcoming" | "completed" | "cancelled";

function isPast(travelDateYyyymmdd: string): boolean {
  const iso = fromYyyymmdd(travelDateYyyymmdd);
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

function tabOf(row: FlightBookingRow): StatusTab {
  if (row.status === "CANCELLED") return "cancelled";
  if (row.status === "CONFIRMED" && isPast(row.travelDate)) return "completed";
  return "upcoming";
}

/** Client component so the Upcoming/Completed/Cancelled split (which needs today's date, not just a
 * status field) can run in the browser — the parent page stays a server component doing the actual
 * data fetch/row-building exactly as before, just handing the finished rows to this component. */
export function FlightBookingsStatusTabs({ rows }: { rows: FlightBookingRow[] }) {
  const [tab, setTab] = React.useState<StatusTab>("upcoming");

  const counts = React.useMemo(() => {
    const c: Record<StatusTab, number> = { upcoming: 0, completed: 0, cancelled: 0 };
    rows.forEach((r) => (c[tabOf(r)] += 1));
    return c;
  }, [rows]);

  const visible = React.useMemo(() => rows.filter((r) => tabOf(r) === tab), [rows, tab]);

  const TABS: { key: StatusTab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <div className="mt-6 flex items-center gap-1 border-b border-slate-100">
        {TABS.map((t) => (
          <button key={t.key} type="button" className="tab-underline px-3" data-active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label} <span className="text-xs text-slate-400">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">
          {tab === "upcoming" ? "No upcoming flight bookings." : tab === "completed" ? "No completed flights yet." : "No cancelled bookings."}
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {visible.map((r) => (
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
