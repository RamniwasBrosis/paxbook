import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Plane } from "lucide-react";
import type { FlightBookingDto, FlightLegDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { formatDateTimeLong, formatMinutes } from "@/lib/flights";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "E-Ticket" };

const TYPE_LABEL: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };

export default async function FlightTicketPage({ params }: { params: { id: string } }) {
  let booking: FlightBookingDto;
  try {
    booking = await customerFetch<FlightBookingDto>(`/customer/flight-bookings/${params.id}`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  const isTicketed = booking.status === "CONFIRMED" || booking.status === "PENDING_CONFIRMATION";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:py-0">
      <div className="rounded-2xl border border-slate-200 p-8 print:border-none">
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-brand" strokeWidth={1.75} />
            <div>
              <p className="text-xl font-bold text-brand">Paxbook</p>
              <p className="text-xs text-slate-400">Electronic Ticket / Itinerary</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">PNR {booking.pnr ?? "—"}</p>
            <p className="text-slate-400">Booked {new Date(booking.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        {!isTicketed ? (
          <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This booking is {booking.status.replace(/_/g, " ").toLowerCase()} — the ticket below reflects what was requested and will be finalized once
            confirmed.
          </p>
        ) : null}

        {booking.legs.length > 0 ? (
          <TicketSection title="Departure" legs={booking.legs} />
        ) : (
          <p className="mt-6 text-sm text-slate-500">
            {booking.depCity} → {booking.arrCity}, {booking.onDate}
          </p>
        )}
        {booking.returnLegs && booking.returnLegs.length > 0 ? <TicketSection title="Return" legs={booking.returnLegs} /> : null}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold uppercase text-slate-400">Passengers</p>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-1 pr-4 font-medium">Name</th>
                <th className="py-1 pr-4 font-medium">Type</th>
                <th className="py-1 pr-4 font-medium">Ticket no.</th>
                <th className="py-1 font-medium">PNR</th>
              </tr>
            </thead>
            <tbody>
              {booking.passengers.map((p) => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="py-2 pr-4 text-slate-900">
                    {p.title} {p.fName} {p.lName}
                  </td>
                  <td className="py-2 pr-4 text-slate-500">{TYPE_LABEL[p.pType] ?? p.pType}</td>
                  <td className="py-2 pr-4 text-slate-500">{p.ticketNo ?? "—"}</td>
                  <td className="py-2 text-slate-500">{p.pnr ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {booking.fare ? (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase text-slate-400">Baggage &amp; fare</p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Field label="Check-in baggage" value={booking.fare.baggageCheckIn || "—"} />
              <Field label="Cabin baggage" value={booking.fare.baggageCabin || "—"} />
              <Field label="Fare type" value={booking.fare.fareTypeLabel} />
              <Field label="Refundable" value={booking.fare.refundable ? "Yes" : "No"} />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="font-semibold text-slate-900">Total paid</p>
          <p className="text-2xl font-bold text-slate-900">
            {booking.currency} {booking.totalAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Please carry a valid photo ID matching the passenger name(s) above. Arrive at the airport at least 2 hours before domestic departure. This document
          is proof of your booking with Paxbook and the airline named above — it is not a boarding pass.
        </p>

        <PrintButton label="Print / Save as PDF" />
      </div>
    </div>
  );
}

function TicketSection({ title, legs }: { title: string; legs: FlightLegDto[] }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase text-slate-400">{title}</p>
      <div className="mt-3 flex flex-col gap-4">
        {legs.map((leg, idx) => (
          <div key={idx} className="rounded-xl bg-mist p-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-navy-deep">
                {leg.airlineName} {leg.airlineCode}-{leg.flightNo}
              </p>
              <p className="text-slate-500">{formatMinutes(leg.durationMinutes)}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-navy-deep">{leg.depCode}</p>
                <p className="text-slate-500">{leg.depAirportName}</p>
                {leg.depTerminal ? <p className="text-xs text-slate-400">Terminal {leg.depTerminal}</p> : null}
                <p className="mt-1 text-slate-700">{formatDateTimeLong(leg.depDateTime)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy-deep">{leg.arrCode}</p>
                <p className="text-slate-500">{leg.arrAirportName}</p>
                {leg.arrTerminal ? <p className="text-xs text-slate-400">Terminal {leg.arrTerminal}</p> : null}
                <p className="mt-1 text-slate-700">{formatDateTimeLong(leg.arrDateTime)}</p>
              </div>
            </div>
            {leg.aircraftType ? <p className="mt-2 text-xs text-slate-400">Aircraft: {leg.aircraftType}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}
