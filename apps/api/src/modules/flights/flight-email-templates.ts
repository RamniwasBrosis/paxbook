import type { FlightLegDto } from "@paxbook/types";

function formatLegDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function legRowHtml(leg: FlightLegDto): string {
  return `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #e2e8f0">
        <div style="font-weight:700;color:#0f172a">${leg.airlineName} ${leg.airlineCode}-${leg.flightNo}</div>
        <div style="color:#64748b;font-size:12px">${formatDuration(leg.durationMinutes)}${leg.aircraftType ? ` · ${leg.aircraftType}` : ""}</div>
      </td>
      <td style="padding:10px 0;border-top:1px solid #e2e8f0;text-align:right">
        <div style="color:#0f172a"><b>${leg.depCode}</b> ${formatLegDateTime(leg.depDateTime)}</div>
        <div style="color:#64748b;font-size:12px">→ <b>${leg.arrCode}</b> ${formatLegDateTime(leg.arrDateTime)}</div>
      </td>
    </tr>`;
}

/** Matches the confirmation-email format the client asked us to follow (flight info table,
 * passenger table, reference number) — inline-styled since email clients don't run Tailwind. */
export function buildBookingConfirmedEmailHtml(opts: {
  customerName: string;
  legs: FlightLegDto[];
  passengers: Array<{ title: string; fName: string; lName: string }>;
  pnr: string | null;
  ticketUrl: string;
  hasAttachment: boolean;
}): string {
  const { customerName, legs, passengers, pnr, ticketUrl, hasAttachment } = opts;
  const passengerRows = passengers
    .map((p) => `<tr><td style="padding:8px 0;border-top:1px solid #e2e8f0;color:#0f172a">${p.title} ${p.fName} ${p.lName}</td></tr>`)
    .join("");
  const legRows = legs.map(legRowHtml).join("");

  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <p style="margin:0 0 4px">Dear ${customerName},</p>
    <h2 style="color:#15803d;margin:0 0 16px;font-size:18px">Thank you! Your booking has been confirmed</h2>
    <p style="color:#475569;font-size:13px;margin:0 0 20px">
      ${hasAttachment ? "Your ticket has been attached to this email as a PDF. " : ""}Please quote the reference number below in any future communication
      with us. If you have any questions, reach us anytime at
      <a href="mailto:planners@paxbook.in" style="color:#19377f">planners@paxbook.in</a> or +91 73000 47077.
    </p>

    <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="background:#dcfce7;padding:14px;border-radius:8px 0 0 8px;width:50%">
          <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Booking status</div>
          <div style="font-size:16px;font-weight:700;color:#15803d">Confirmed</div>
        </td>
        <td style="background:#f1f5f9;padding:14px;border-radius:0 8px 8px 0;width:50%">
          <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Reference number</div>
          <div style="font-size:16px;font-weight:700">${pnr ?? "—"}</div>
        </td>
      </tr>
    </table>

    <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:6px">Flight information</div>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:24px">
      ${legRows}
    </table>

    <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:6px">Passenger information</div>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:28px">
      ${passengerRows}
    </table>

    <p style="margin:0 0 28px">
      <a href="${ticketUrl}" style="background:#f1ba4b;color:#19377f;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">View your e-ticket</a>
    </p>

    <p style="color:#94a3b8;font-size:11px;margin:0">
      Please do not reply to this email — it was sent from an address that isn't monitored. This document is proof of your booking with Paxbook and
      the airline named above; it is not a boarding pass.
    </p>
    <p style="color:#94a3b8;font-size:11px;margin-top:16px">Paxbook — Travel | Explore | Experience</p>
  </div>`;
}
