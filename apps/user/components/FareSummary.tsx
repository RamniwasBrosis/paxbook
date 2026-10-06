"use client";

import * as React from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

export interface FareSummaryLine {
  label: string;
  amount: number;
}

const inr = (n: number) => `₹${(Math.round(n * 100) / 100).toLocaleString("en-IN")}`;

/**
 * "Fare summary" in the booking sidebar, MakeMyTrip style: base fare and taxes (each opens to show
 * the per-flight split), then add-ons and the coupon, then the total. Taxes are shown as total minus
 * base so the lines always add up to what the customer pays.
 */
export function FareSummary({
  base,
  taxes,
  baseDetail,
  taxDetail,
  extras,
  discount,
  total,
  travellers,
}: {
  base: number;
  taxes: number;
  baseDetail?: FareSummaryLine[];
  taxDetail?: FareSummaryLine[];
  extras: FareSummaryLine[];
  discount: { code: string; amount: number } | null;
  total: number;
  travellers: number;
}) {
  return (
    <section aria-labelledby="fare-summary-title" className="border-t border-slate-100 pt-4">
      <h2 id="fare-summary-title" className="font-display text-lg font-extrabold text-navy-deep">
        Fare summary
      </h2>
      <p className="text-xs text-ink-muted">
        {travellers} traveller{travellers > 1 ? "s" : ""}
      </p>
      <dl className="mt-3 divide-y divide-slate-100 text-sm">
        <ExpandableRow label="Base fare" amount={base} detail={baseDetail} />
        <ExpandableRow label="Taxes & surcharges" amount={taxes} detail={taxDetail} />
        {extras
          .filter((e) => e.amount > 0)
          .map((e) => (
            <div key={e.label} className="flex justify-between py-2.5 text-navy-deep">
              <dt>{e.label}</dt>
              <dd className="font-semibold">{inr(e.amount)}</dd>
            </div>
          ))}
        {discount && discount.amount > 0 ? (
          <div className="flex justify-between py-2.5 font-semibold text-emerald-700">
            <dt>Coupon {discount.code}</dt>
            <dd>−{inr(discount.amount)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-2 flex items-baseline justify-between rounded-2xl bg-cream px-4 py-3 text-navy-deep">
        <span className="font-bold">Total amount</span>
        <span className="font-display text-2xl font-extrabold">{inr(total)}</span>
      </div>
    </section>
  );
}

function ExpandableRow({ label, amount, detail }: { label: string; amount: number; detail?: FareSummaryLine[] }) {
  const [open, setOpen] = React.useState(false);
  const canExpand = Boolean(detail && detail.length > 1);
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between text-navy-deep">
        <dt>
          {canExpand ? (
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-2 font-semibold hover:text-brand-blue">
              {open ? <MinusCircle className="h-4 w-4" strokeWidth={2} /> : <PlusCircle className="h-4 w-4" strokeWidth={2} />}
              {label}
            </button>
          ) : (
            <span className="font-semibold">{label}</span>
          )}
        </dt>
        <dd className="font-semibold">{inr(amount)}</dd>
      </div>
      {canExpand && open ? (
        <ul className="mt-1.5 space-y-1 pl-6 text-xs text-ink-muted">
          {detail!.map((d) => (
            <li key={d.label} className="flex justify-between">
              <span>{d.label}</span>
              <span>{inr(d.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
