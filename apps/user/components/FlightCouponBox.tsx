"use client";

import * as React from "react";
import { BadgePercent, Check, Loader2, X } from "lucide-react";
import type { CouponQuoteDto, PublicCouponDto } from "@paxbook/types";
import { getClientTenantHeader } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

function offerLabel(c: PublicCouponDto): string {
  if (c.discountType === "PERCENT") return `${c.value}% off${c.maxDiscountAmount ? ` up to ₹${c.maxDiscountAmount.toLocaleString("en-IN")}` : ""}`;
  return `₹${c.value.toLocaleString("en-IN")} off`;
}

class RateLimitedError extends Error {
  constructor() {
    super("Too many tries. Please wait a minute and try again.");
  }
}

async function fetchQuote(code: string, amount: number): Promise<CouponQuoteDto> {
  const res = await fetch(`${API_BASE_URL}/public/flights/coupons/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
    body: JSON.stringify({ code, amount }),
  });
  if (res.status === 429) throw new RateLimitedError();
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "This coupon can't be applied.");
  return json.data as CouponQuoteDto;
}

export interface FlightCouponState {
  applied: CouponQuoteDto | null;
  error: string | null;
  busyCode: string | null;
  apply: (code: string) => Promise<boolean>;
  remove: () => void;
}

/**
 * The applied coupon for a booking. Lives in the wizard so the sidebar and phone copies of the
 * coupon box share it, and so a change in add-ons re-prices the coupon once.
 */
export function useFlightCoupon(amount: number): FlightCouponState {
  const [applied, setApplied] = React.useState<CouponQuoteDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyCode, setBusyCode] = React.useState<string | null>(null);

  const appliedCode = applied?.code;
  React.useEffect(() => {
    if (!appliedCode) return;
    let cancelled = false;
    const t = setTimeout(() => {
      fetchQuote(appliedCode, amount)
        .then((q) => !cancelled && setApplied(q))
        .catch((err) => {
          // A rate-limited re-check keeps the coupon: the booking prices it again on the server anyway.
          if (cancelled || err instanceof RateLimitedError) return;
          setApplied(null);
          setError(err instanceof Error ? err.message : "This coupon no longer applies.");
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const apply = React.useCallback(
    async (raw: string) => {
      const c = raw.trim().toUpperCase();
      if (!c) return false;
      setBusyCode(c);
      setError(null);
      try {
        setApplied(await fetchQuote(c, amount));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "This coupon can't be applied.");
        return false;
      } finally {
        setBusyCode(null);
      }
    },
    [amount],
  );

  const remove = React.useCallback(() => {
    setApplied(null);
    setError(null);
  }, []);

  return { applied, error, busyCode, apply, remove };
}

/** "Coupons and offers" on the booking page: the admin's checkout coupons plus a code field. The
 * discount shown is a preview; the server prices the coupon again when the booking is created. */
export function FlightCouponBox({ coupon, className = "" }: { coupon: FlightCouponState; className?: string }) {
  const { applied, error, busyCode } = coupon;
  const [coupons, setCoupons] = React.useState<PublicCouponDto[]>([]);
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/public/flights/coupons`, { headers: getClientTenantHeader() })
      .then((res) => res.json())
      .then((json) => setCoupons(json.success ? (json.data as PublicCouponDto[]) : []))
      .catch(() => setCoupons([]));
  }, []);

  async function apply(raw: string) {
    if (await coupon.apply(raw)) setCode("");
  }

  return (
    <section aria-labelledby="coupons-title" className={`flat-card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-accent to-amber-200 px-5 py-4">
        <h2 id="coupons-title" className="font-display text-lg font-extrabold text-navy-deep">
          Coupons and offers
        </h2>
        <BadgePercent className="h-7 w-7 text-navy-deep/80" strokeWidth={2} />
      </div>
      <div className="p-5">
        {applied ? (
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3">
            <div>
              <p className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                <Check className="h-4 w-4" strokeWidth={3} /> {applied.code} applied
              </p>
              <p className="mt-0.5 text-sm text-emerald-800">You save ₹{applied.discount.toLocaleString("en-IN")}</p>
            </div>
            <button
              type="button"
              onClick={coupon.remove}
              aria-label={`Remove coupon ${applied.code}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-emerald-800 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          // Not a <form>: this box also renders inside the booking form, and forms can't nest.
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void apply(code);
                }
              }}
              placeholder="Enter coupon code"
              aria-label="Coupon code"
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold uppercase tracking-wide text-navy-deep outline-none placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
            <button
              type="button"
              onClick={() => void apply(code)}
              disabled={!code.trim() || busyCode !== null}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-navy-deep px-4 text-sm font-bold text-white transition-colors hover:bg-brand-blue disabled:opacity-40"
            >
              {busyCode && busyCode === code.trim() ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Apply
            </button>
          </div>
        )}
        {error ? (
          <p role="alert" className="mt-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        {coupons.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2.5">
            {coupons.map((c) => {
              const isApplied = applied?.code === c.code;
              return (
                <li key={c.code} className={`rounded-2xl border px-4 py-3 ${isApplied ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2">
                        <span className="rounded-md border border-dashed border-accent-ink/60 bg-cream px-2 py-0.5 font-mono text-xs font-extrabold tracking-wider text-navy-deep">{c.code}</span>
                        <span className="text-sm font-extrabold text-emerald-700">{offerLabel(c)}</span>
                      </p>
                      {c.description ? <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{c.description}</p> : null}
                      {c.minBookingAmount ? <p className="mt-1 text-[11px] text-ink-muted">On bookings above ₹{c.minBookingAmount.toLocaleString("en-IN")}</p> : null}
                    </div>
                    {isApplied ? (
                      <span className="shrink-0 text-xs font-extrabold text-emerald-700">Applied</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void apply(c.code)}
                        disabled={busyCode !== null}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-brand-blue hover:text-navy-deep disabled:opacity-40"
                      >
                        {busyCode === c.code ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Apply
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
