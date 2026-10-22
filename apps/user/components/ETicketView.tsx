import { Download, ExternalLink, Phone, Mail, Plane } from "lucide-react";
import type { FlightTicketDto } from "@paxbook/types";
import { AirlineLogo } from "@/components/AirlineLogo";
import { PrintButton } from "@/components/PrintButton";

function dateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ (\d{2})$/, "'$1"),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  };
}

function hm(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function inr(n: number, currency: string): string {
  return `${currency === "INR" ? "₹" : `${currency} `}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const CHECKLIST = [
  "Complete your web check-in on the airline's website or app before reaching the airport.",
  "Report at the airport at least 2 hours before domestic and 3 hours before international departures.",
];

const TERMS = [
  "All flight timings are in the local time of the airport.",
  "The traveller's name or title cannot be changed after booking.",
  "Carry a valid photo ID (passport for international trips). For an infant, carry the birth certificate.",
  "Use the airline PNR when talking to the airline; use the Booking ID above for all communication with Paxbook.",
  "Free baggage allowance does not apply to infants. Meals, seats and special requests depend on the airline.",
  "Cancellation and date changes are subject to airline fees; Paxbook's service fee is not refundable. No-show tickets are non-refundable.",
  "Refunds for airline cancellations or delays are processed once the airline refunds the amount.",
  "For international trips, your passport must be valid for at least 6 months; check transit and destination visa rules.",
  "This e-ticket is proof of booking, not a boarding pass. The boarding pass is issued by the airline at check-in.",
];

/**
 * The e-ticket on screen, laid out like an airline/OTA ticket and matching the PDF (same server data):
 * header with booking ID and support, PNR status card per direction, flight table, passengers with a
 * PDF417 barcode each, contact, fare breakup, checklist and terms. Prints cleanly.
 */
export function ETicketView({ ticket, pdfHref }: { ticket: FlightTicketDto; pdfHref: string }) {
  const confirmed = ticket.status === "CONFIRMED";
  const f = ticket.fare;
  const fareRows: Array<[string, number, boolean?]> = [
    ["Base fare", f.base],
    ["Tax & surcharges", f.taxes],
    ["Total fare", f.fareTotal, true],
    ["Baggage & meals", f.baggageAndMeals],
    ["Seats", f.seats],
    ["Web check-in", f.webCheckin],
    ["Convenience fee", f.convenienceFee],
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl print:max-w-none">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3 print:hidden">
        <a href={pdfHref} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-deep px-5 text-sm font-bold text-white hover:bg-brand-blue">
          <Download className="h-4 w-4" /> Download PDF
        </a>
        <PrintButton label="Print" className="inline-flex h-11 items-center rounded-full border-2 border-navy-deep px-5 text-sm font-bold text-navy-deep hover:bg-navy-deep hover:text-white print:hidden" />
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-deep font-display text-2xl font-extrabold text-accent">P</span>
            <div className="leading-tight">
              <p className="font-display text-xl font-extrabold text-navy-deep">Paxbook</p>
              <p className="text-sm text-ink-muted">
                Booking ID: <strong className="font-mono text-navy-deep">{ticket.bookingRef}</strong>
              </p>
              <p className="text-sm text-ink-muted">Booking date: {new Date(ticket.bookedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <div className="text-right text-sm leading-relaxed">
            <p className="font-bold text-navy-deep">Need help with your trip?</p>
            <p className="flex items-center justify-end gap-1.5 text-ink-muted">
              <Mail className="h-3.5 w-3.5" /> {ticket.support.email}
            </p>
            <a href={`tel:${ticket.support.phone.replace(/\s/g, "")}`} className="flex items-center justify-end gap-1.5 font-semibold text-brand-blue">
              <Phone className="h-3.5 w-3.5" /> {ticket.support.phone}
            </a>
          </div>
        </header>

        {/* PNR status cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ticket.directions.map((d) => (
            <div key={d.label} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <AirlineLogo code={d.airlineCode} size={40} />
                <div className="leading-tight">
                  <p className="text-xs text-ink-muted">
                    {d.label} · {d.airlineName}
                  </p>
                  <p className="font-display text-xl font-extrabold text-navy-deep">{d.route}</p>
                  <p className={`mt-0.5 font-display text-base font-extrabold ${confirmed ? "text-emerald-600" : "text-amber-600"}`}>
                    {d.pnr ?? "PNR pending"} <span className="ml-1.5">{ticket.status.replace(/_/g, " ")}</span>
                  </p>
                </div>
              </div>
              {d.webCheckinUrl ? (
                <a href={d.webCheckinUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-navy-deep px-2.5 py-1 text-xs font-bold text-navy-deep hover:bg-navy-deep hover:text-white print:hidden">
                  Web check-in <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {/* Flight details */}
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Flight details</h2>
        {ticket.directions.map((d) => (
          <section key={d.label} className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-mist px-4 py-2.5">
              <p className="flex items-center gap-2 font-display text-lg font-extrabold text-brand-blue">
                {d.fromCity} <Plane className="h-4 w-4" /> {d.toCity}
              </p>
              <p className={`text-sm font-bold ${d.refundable ? "text-emerald-700" : "text-red-600"}`}>{d.refundable ? "Refundable (fees apply)" : "Non-refundable"}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {d.segments.map((s, i) => {
                const dep = dateTime(s.depDateTime);
                const arr = dateTime(s.arrDateTime);
                return (
                  <div key={i} className="grid grid-cols-2 gap-4 px-4 py-4 text-sm sm:grid-cols-[1.1fr_0.9fr_1.4fr_1.4fr_auto]">
                    <div className="flex items-start gap-2">
                      <AirlineLogo code={s.airlineCode} size={30} />
                      <div className="leading-tight">
                        <p className="text-xs text-ink-muted">{s.airlineName}</p>
                        <p className="font-display text-base font-extrabold text-navy-deep">
                          {s.airlineCode}-{s.flightNo}
                        </p>
                      </div>
                    </div>
                    <div className="leading-tight">
                      <p className="text-navy-deep">{d.cabin}</p>
                      {d.fareType ? <p className="text-xs font-semibold text-emerald-700">{d.fareType}</p> : null}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs text-ink-muted">Departing</p>
                      <p className="font-display text-base font-extrabold text-navy-deep">
                        {dep.date} - {dep.time}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {s.depCode}-{s.depAirportName}
                        {s.depTerminal ? `, Terminal ${s.depTerminal}` : ""}
                      </p>
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs text-ink-muted">Arriving</p>
                      <p className="font-display text-base font-extrabold text-navy-deep">
                        {arr.date} - {arr.time}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {s.arrCode}-{s.arrAirportName}
                        {s.arrTerminal ? `, Terminal ${s.arrTerminal}` : ""}
                      </p>
                    </div>
                    <div className="leading-tight sm:text-right">
                      <p className="text-xs text-ink-muted">Duration</p>
                      <p className="font-display text-base font-extrabold text-navy-deep">{hm(s.durationMinutes)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Passengers */}
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Passenger details</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist text-xs font-bold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">Sector PNR (ticket no.)</th>
                <th className="px-3 py-2.5">Barcode</th>
                <th className="px-3 py-2.5">Baggage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ticket.passengers.map((p, i) => (
                <tr key={i} className="align-top">
                  <td className="px-3 py-3 text-ink-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    <p className="font-bold uppercase text-navy-deep">{p.name}</p>
                    <p className="text-xs text-ink-muted">({p.type})</p>
                  </td>
                  <td className="px-3 py-3">
                    {p.sectors.map((s) => (
                      <div key={s.route} className="mb-1 leading-tight last:mb-0">
                        <p className="text-xs font-bold text-navy-deep">{s.route.replace("-", " ")}</p>
                        <p className="font-mono font-extrabold text-emerald-600">{s.pnr ?? "Pending"}</p>
                        {s.ticketNo ? <p className="font-mono text-xs text-ink-muted">({s.ticketNo})</p> : null}
                      </div>
                    ))}
                  </td>
                  <td className="px-3 py-3">
                    {/* The SVG is generated on our server by bwip-js from the booking data, not user HTML. */}
                    <div className="w-48 [&>svg]:h-auto [&>svg]:w-full" aria-label={`Barcode for ${p.name}`} role="img" dangerouslySetInnerHTML={{ __html: p.barcodeSvg }} />
                  </td>
                  <td className="px-3 py-3 text-xs text-navy-deep">
                    <p>Cabin: {p.baggage.cabin}</p>
                    <p>Check-in: {p.baggage.checkIn}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact */}
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Traveller information</h2>
        <div className="mt-3 grid overflow-hidden rounded-2xl border border-slate-200 text-sm sm:grid-cols-2">
          <p className="px-4 py-3">
            <span className="text-ink-muted">Email: </span>
            <span className="font-semibold text-navy-deep">{ticket.contact.email ?? "—"}</span>
          </p>
          <p className="border-t border-slate-100 px-4 py-3 sm:border-l sm:border-t-0">
            <span className="text-ink-muted">Mobile: </span>
            <span className="font-semibold text-navy-deep">{ticket.contact.mobile ?? "—"}</span>
          </p>
        </div>

        {/* Fare breakup */}
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Fare breakup</h2>
        <div className="mt-3 max-w-md overflow-hidden rounded-2xl border border-slate-200 text-sm">
          {fareRows.map(([label, amount, bold]) => (
            <div key={label} className={`flex justify-between border-b border-slate-100 px-4 py-2.5 ${bold ? "bg-mist font-bold text-navy-deep" : "text-navy-deep"}`}>
              <span>{label}</span>
              <span>{inr(amount, f.currency)}</span>
            </div>
          ))}
          {f.discount > 0 ? (
            <div className="flex justify-between border-b border-slate-100 px-4 py-2.5 font-semibold text-emerald-700">
              <span>Coupon {f.couponCode}</span>
              <span>−{inr(f.discount, f.currency)}</span>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between px-4 py-3">
            <span className="font-display text-lg font-extrabold text-navy-deep">Grand total</span>
            <span className="font-display text-xl font-extrabold text-navy-deep">{inr(f.grandTotal, f.currency)}</span>
          </div>
        </div>

        {/* Checklist + terms */}
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Mandatory check-list for passengers</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-navy-deep">
          {CHECKLIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
        <h2 className="mt-7 font-display text-xl font-extrabold text-navy-deep">Terms &amp; conditions</h2>
        <div className="mt-3 grid gap-2 text-xs leading-relaxed text-navy-deep sm:grid-cols-2">
          {TERMS.map((t) => (
            <p key={t} className="rounded-xl border border-slate-200 px-3 py-2.5">
              {t}
            </p>
          ))}
        </div>
        <p className="mt-7 text-center font-display text-lg font-extrabold text-navy-deep">Have a nice trip!</p>
      </article>
    </div>
  );
}
