import { CheckCircle2 } from "lucide-react";

/** One-time celebratory banner shown right after a successful payment redirect (driven by a
 * `?justBooked=1` query param that naturally disappears on any later revisit) — not a persistent
 * page state. */
export function BookingConfirmedBanner({ pnr }: { pnr?: string | null }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
      <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" strokeWidth={1.75} />
      <div>
        <p className="font-bold text-emerald-800">Booking confirmed!</p>
        <p className="text-sm text-emerald-700">{pnr ? `Your PNR is ${pnr}. ` : ""}A confirmation has been sent to your registered email.</p>
      </div>
    </div>
  );
}
