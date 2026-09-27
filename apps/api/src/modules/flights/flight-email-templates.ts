import type { FlightLegDto } from "@paxbook/types";
import { escapeHtml, renderEmail } from "../../common/email/email-layout";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function formatLegDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function legsSection(legs: FlightLegDto[]) {
  const rows = legs
    .map(
      (leg, i) => `<tr>
        <td style="padding:12px 14px;${i ? "border-top:1px solid #e3e8f3;" : ""}font:700 14px/1.4 ${FONT};color:#122a63">${escapeHtml(leg.airlineName)} ${escapeHtml(leg.airlineCode)}-${escapeHtml(leg.flightNo)}<div style="font:400 12px/1.5 ${FONT};color:#51628f">${formatDuration(leg.durationMinutes)}${leg.aircraftType ? ` · ${escapeHtml(leg.aircraftType)}` : ""}</div></td>
        <td style="padding:12px 14px;${i ? "border-top:1px solid #e3e8f3;" : ""}font:400 13px/1.5 ${FONT};color:#1c2d5c;text-align:right"><b>${escapeHtml(leg.depCode)}</b> ${escapeHtml(formatLegDateTime(leg.depDateTime))}<br><span style="color:#51628f">→ <b>${escapeHtml(leg.arrCode)}</b> ${escapeHtml(formatLegDateTime(leg.arrDateTime))}</span></td>
      </tr>`,
    )
    .join("");
  return {
    heading: "Flight information",
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e3e8f3;border-radius:12px;border-collapse:separate">${rows}</table>`,
    text: legs
      .map((l) => `${l.airlineName} ${l.airlineCode}-${l.flightNo}: ${l.depCode} ${formatLegDateTime(l.depDateTime)} → ${l.arrCode} ${formatLegDateTime(l.arrDateTime)}`)
      .join("\n"),
  };
}

function passengersSection(passengers: Array<{ title: string; fName: string; lName: string }>) {
  const names = passengers.map((p) => `${p.title} ${p.fName} ${p.lName}`);
  return {
    heading: "Passengers",
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e3e8f3;border-radius:12px;border-collapse:separate">${names
      .map((n, i) => `<tr><td style="padding:11px 14px;${i ? "border-top:1px solid #e3e8f3;" : ""}font:600 14px/1.4 ${FONT};color:#1c2d5c">${i + 1}. ${escapeHtml(n)}</td></tr>`)
      .join("")}</table>`,
    text: names.map((n, i) => `${i + 1}. ${n}`).join("\n"),
  };
}

/** Flight e-ticket confirmation: status + PNR, flight table, passenger table, e-ticket button. */
export function buildBookingConfirmedEmail(opts: {
  customerName: string;
  legs: FlightLegDto[];
  passengers: Array<{ title: string; fName: string; lName: string }>;
  pnr: string | null;
  ticketUrl: string;
  hasAttachment: boolean;
}) {
  const route = opts.legs.length ? `${opts.legs[0]!.depCode} → ${opts.legs[opts.legs.length - 1]!.arrCode}` : "";
  return renderEmail({
    preheader: `Your flight ${route} is confirmed. PNR ${opts.pnr ?? "to follow"}.${opts.hasAttachment ? " E-ticket attached." : ""}`,
    eyebrow: "Flight booking",
    title: "Your flight is confirmed",
    recipientName: opts.customerName,
    status: { label: "Confirmed", tone: "success" },
    paragraphs: [
      `${opts.hasAttachment ? "Your e-ticket is attached to this email as a PDF. " : ""}Please quote your PNR in any communication with us or the airline.`,
    ],
    details: [
      ["PNR / reference", opts.pnr ?? "Will be shared shortly"],
      ["Route", route],
      ["Travellers", String(opts.passengers.length)],
    ],
    sections: [legsSection(opts.legs), passengersSection(opts.passengers)],
    cta: { label: "View your e-ticket", url: opts.ticketUrl },
    note: "This email confirms your booking; it is not a boarding pass. Check in with the airline before you fly — we can help with web check-in.",
  });
}

export function buildFlightFailedEmail(opts: { depCity: string; arrCity: string; onDate: string; refundNote: string }) {
  return renderEmail({
    preheader: `We couldn't complete your flight ${opts.depCity} → ${opts.arrCity}. ${opts.refundNote}`,
    eyebrow: "Flight booking",
    title: "We couldn't complete your flight booking",
    status: { label: "Not booked", tone: "danger" },
    paragraphs: [`Unfortunately the airline didn't confirm your booking.`, opts.refundNote, "We're sorry for the inconvenience. Reply to this email and our team will help you book an alternative."],
    details: [
      ["Route", `${opts.depCity} → ${opts.arrCity}`],
      ["Travel date", opts.onDate],
    ],
  });
}

export function buildFlightCancelledEmail(opts: { depCity: string; arrCity: string; onDate: string; allCancelled: boolean; refundLine: string; ticketUrl: string }) {
  return renderEmail({
    preheader: `Your flight ${opts.depCity} → ${opts.arrCity} ${opts.allCancelled ? "has been cancelled" : "is being cancelled"}. ${opts.refundLine}`,
    eyebrow: "Flight booking",
    title: opts.allCancelled ? "Your flight booking has been cancelled" : "Your cancellation is in progress",
    status: opts.allCancelled ? { label: "Cancelled", tone: "danger" } : { label: "Cancellation in progress", tone: "warning" },
    paragraphs: [opts.refundLine],
    details: [
      ["Route", `${opts.depCity} → ${opts.arrCity}`],
      ["Travel date", opts.onDate],
    ],
    cta: { label: "View booking", url: opts.ticketUrl },
    note: "Refunds go back to your original payment method. Banks usually take 5–7 working days to show them.",
  });
}

export function buildDateChangeRequestedEmail(opts: { depCity: string; arrCity: string; newTravelDate: string; reference: string; bookingUrl: string }) {
  return renderEmail({
    preheader: `Your request to move ${opts.depCity} → ${opts.arrCity} to ${opts.newTravelDate} has been submitted.`,
    eyebrow: "Flight booking",
    title: "Date change request received",
    status: { label: "Request submitted", tone: "info" },
    paragraphs: ["We've sent your date change to the airline. Our team will confirm any fare difference and complete the change shortly."],
    details: [
      ["Route", `${opts.depCity} → ${opts.arrCity}`],
      ["New travel date", opts.newTravelDate],
      ["Reference", opts.reference],
    ],
    cta: { label: "View booking", url: opts.bookingUrl },
  });
}

export function buildDateChangeResolvedEmail(opts: { depCity: string; arrCity: string; note?: string; bookingUrl: string }) {
  return renderEmail({
    preheader: `Your date change request for ${opts.depCity} → ${opts.arrCity} has been processed.`,
    eyebrow: "Flight booking",
    title: "Your date change request has been processed",
    status: { label: "Processed", tone: "success" },
    paragraphs: ["Our team has processed your date change request. Your updated booking details are in your account.", ...(opts.note ? [`Note from our team: ${opts.note}`] : [])],
    details: [["Route", `${opts.depCity} → ${opts.arrCity}`]],
    cta: { label: "View booking", url: opts.bookingUrl },
  });
}

export function buildRefundIssuedEmail(opts: { depCity: string; arrCity: string; amount: string; reference: string; bookingUrl: string }) {
  return renderEmail({
    preheader: `Refund of ${opts.amount} issued for your flight ${opts.depCity} → ${opts.arrCity}.`,
    eyebrow: "Refund",
    title: "Your refund has been issued",
    status: { label: "Refund issued", tone: "success" },
    paragraphs: ["We've sent your refund to your original payment method."],
    details: [
      ["Route", `${opts.depCity} → ${opts.arrCity}`],
      ["Refund amount", opts.amount],
      ["Refund reference", opts.reference],
    ],
    cta: { label: "View booking", url: opts.bookingUrl },
    note: "Banks usually take 5–7 working days to show the amount in your account. Quote the refund reference if you need to follow up with your bank.",
  });
}
