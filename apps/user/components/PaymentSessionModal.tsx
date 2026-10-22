"use client";

import * as React from "react";
import { ChevronDown, Clock, Loader2, ShieldCheck, TimerOff } from "lucide-react";
import { Modal } from "@/components/Modal";

export interface PaymentLine {
  label: string;
  amount: number;
  /** Shown in green with a minus sign (coupon). */
  discount?: boolean;
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}m : ${String(s % 60).padStart(2, "0")}s`;
}

const inr = (n: number) => `₹${(Math.round(n * 100) / 100).toLocaleString("en-IN")}`;

/**
 * The payment step after "Confirm & continue": a countdown to the payment deadline the server set
 * when the booking was made (admin setting, default 9 minutes), the total due with its breakdown,
 * the trip and travellers, and the Pay button that opens Razorpay. When time runs out the session
 * is over: the button is replaced by "Start again", which re-checks the fare.
 */
export function PaymentSessionModal({
  open,
  onClose,
  expiresAt,
  total,
  lines,
  trip,
  travellers,
  contact,
  notice,
  error,
  busy,
  onPay,
  onRestart,
}: {
  open: boolean;
  onClose: () => void;
  expiresAt: string | null;
  total: number;
  lines: PaymentLine[];
  trip: string[];
  travellers: string[];
  contact: string;
  notice?: string | null;
  error?: string | null;
  busy?: boolean;
  onPay: () => void;
  onRestart: () => void;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  const [showBreakup, setShowBreakup] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  const left = expiresAt ? new Date(expiresAt).getTime() - now : Number.POSITIVE_INFINITY;
  const expired = left <= 0;
  const urgent = left < 60_000;

  return (
    <Modal open={open} onClose={onClose} title="Payment" subtitle="Complete your payment before the timer ends." maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        {expiresAt ? (
          <div
            role="timer"
            aria-live="off"
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
              expired ? "bg-red-50 text-red-700" : urgent ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            <span className="flex items-center gap-2">
              {expired ? <TimerOff className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              {expired ? "Payment session expired" : "Time left to pay"}
            </span>
            {expired ? null : <span className="font-mono text-base">{mmss(left)}</span>}
          </div>
        ) : null}

        {notice ? <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900">{notice}</p> : null}

        <section className="rounded-2xl border border-slate-200">
          <button type="button" onClick={() => setShowBreakup((v) => !v)} aria-expanded={showBreakup} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
            <span>
              <span className="block font-display text-lg font-extrabold text-navy-deep">Total due</span>
              <span className="text-xs text-ink-muted">Incl. taxes and convenience fee</span>
            </span>
            <span className="flex items-center gap-2 font-display text-xl font-extrabold text-navy-deep">
              {inr(total)}
              <ChevronDown className={`h-5 w-5 text-brand-blue transition-transform ${showBreakup ? "rotate-180" : ""}`} />
            </span>
          </button>
          {showBreakup ? (
            <dl className="border-t border-slate-100 px-4 py-3 text-sm">
              {lines
                .filter((l) => l.amount > 0)
                .map((l) => (
                  <div key={l.label} className={`flex justify-between py-1 ${l.discount ? "font-semibold text-emerald-700" : "text-navy-deep"}`}>
                    <dt>{l.label}</dt>
                    <dd>
                      {l.discount ? "−" : ""}
                      {inr(l.amount)}
                    </dd>
                  </div>
                ))}
            </dl>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-navy-deep">
          {trip.map((t) => (
            <p key={t} className="font-semibold">
              {t}
            </p>
          ))}
          <p className="mt-2 text-ink-muted">{travellers.join(", ")}</p>
          <p className="text-ink-muted">{contact}</p>
        </section>

        {error ? (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        {expired ? (
          <button type="button" onClick={onRestart} className="h-12 rounded-full bg-navy-deep text-base font-extrabold text-white hover:bg-brand-blue">
            Start again with the latest fare
          </button>
        ) : (
          <button
            type="button"
            onClick={onPay}
            disabled={busy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-base font-extrabold text-navy-deep shadow-sm hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Pay {inr(total)}
          </button>
        )}
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure payment via Razorpay (UPI, cards, net banking, wallets, EMI)
        </p>
      </div>
    </Modal>
  );
}

/** Seconds left until `expiresAt`, for Razorpay's own checkout timeout. */
export function secondsLeft(expiresAt: string | null): number | undefined {
  if (!expiresAt) return undefined;
  return Math.max(30, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export function convenienceFeeFor(conv: { enabled: boolean; gstPercent: number; base: number } | undefined, discount: number): number {
  if (!conv?.enabled) return 0;
  const finalMargin = conv.base - discount;
  return finalMargin > 0 ? Math.round(finalMargin * conv.gstPercent) / 100 : 0;
}
