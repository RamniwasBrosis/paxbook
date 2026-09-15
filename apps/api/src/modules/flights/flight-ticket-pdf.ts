import PDFDocument from "pdfkit";
import type { FlightFareDto, FlightLegDto } from "@paxbook/types";

export interface TicketPdfPassenger {
  title: string;
  fName: string;
  lName: string;
  pType: string;
  ticketNo: string | null;
  pnr: string | null;
}

export interface TicketPdfData {
  status: string;
  pnr: string | null;
  createdAt: Date;
  legs: FlightLegDto[];
  returnLegs?: FlightLegDto[] | null;
  passengers: TicketPdfPassenger[];
  fare: FlightFareDto | null;
  providerFareAmount: number | null;
  totalAmount: number;
  currency: string;
}

const TYPE_LABEL: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };

function formatLegDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Renders a real PDF e-ticket via pdfkit (pure-JS, no headless browser) — safe to run inline
 * on the live API process's constrained shared hosting, unlike a Puppeteer/Chromium approach.
 *
 * pdfkit's `.text()` leaves its internal cursor at whatever x/y the call used — every call here
 * passes an explicit `x` (and `{width}` where it should wrap) rather than relying on that implicit
 * cursor, since chaining an absolute-positioned call (e.g. the two-column status box) into a plain
 * `.text(str)` call otherwise drags unrelated text sideways to wherever the cursor was left. Also:
 * the standard PDF fonts pdfkit ships (WinAnsi-encoded) don't have a glyph for "→" (renders as
 * garbage) — "->" is used instead everywhere an arrow is needed.
 */
export function buildTicketPdf(data: TicketPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const brand = "#19377f";
    const muted = "#64748b";
    const left = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(18).fillColor(brand).text("Paxbook", left, doc.y, { width: pageWidth });
    doc.fontSize(9).fillColor(muted).text("Electronic Ticket / Itinerary", left, doc.y, { width: pageWidth });
    let y = doc.y + 14;

    const isTicketed = data.status === "CONFIRMED" || data.status === "PENDING_CONFIRMATION";
    const boxWidth = pageWidth / 2 - 4;
    doc.roundedRect(left, y, boxWidth, 46, 4).fill(isTicketed ? "#dcfce7" : "#fef3c7");
    doc.roundedRect(left + boxWidth + 8, y, boxWidth, 46, 4).fill("#f1f5f9");
    doc.fontSize(8).fillColor(muted).text("BOOKING STATUS", left + 10, y + 8, { width: boxWidth - 20 });
    doc.text("REFERENCE NUMBER", left + boxWidth + 18, y + 8, { width: boxWidth - 20 });
    doc
      .fontSize(13)
      .fillColor(isTicketed ? "#15803d" : "#b45309")
      .text(data.status.replace(/_/g, " "), left + 10, y + 20, { width: boxWidth - 20 });
    doc
      .fontSize(13)
      .fillColor("#0f172a")
      .text(data.pnr ?? "—", left + boxWidth + 18, y + 20, { width: boxWidth - 20 });
    y += 58;

    const renderLegSection = (title: string, legs: FlightLegDto[]) => {
      doc.fontSize(9).fillColor(muted).text(title.toUpperCase(), left, y, { width: pageWidth });
      y = doc.y + 4;
      for (const leg of legs) {
        doc.fontSize(11).fillColor("#0f172a").text(`${leg.airlineName} ${leg.airlineCode}-${leg.flightNo}`, left, y, { width: pageWidth });
        y = doc.y;
        doc
          .fontSize(8)
          .fillColor(muted)
          .text(`${formatDuration(leg.durationMinutes)}${leg.aircraftType ? ` · ${leg.aircraftType}` : ""}`, left, y, { width: pageWidth });
        y = doc.y;
        doc
          .fontSize(9)
          .fillColor("#0f172a")
          .text(`${leg.depCode} ${formatLegDateTime(leg.depDateTime)}  ->  ${leg.arrCode} ${formatLegDateTime(leg.arrDateTime)}`, left, y, { width: pageWidth });
        y = doc.y + 10;
      }
    };

    renderLegSection("Departure", data.legs);
    if (data.returnLegs && data.returnLegs.length > 0) renderLegSection("Return", data.returnLegs);

    y += 6;
    doc.fontSize(9).fillColor(muted).text("PASSENGER INFORMATION", left, y, { width: pageWidth });
    y = doc.y + 6;

    const colX = [left, left + 220, left + 340, left + 440];
    const colW = [200, 100, 80, 80];
    doc.fontSize(8).fillColor(muted);
    doc.text("Name", colX[0], y, { width: colW[0] });
    doc.text("Type", colX[1], y, { width: colW[1] });
    doc.text("Ticket no.", colX[2], y, { width: colW[2] });
    doc.text("PNR", colX[3], y, { width: colW[3] });
    y = doc.y + 6;

    for (const p of data.passengers) {
      doc.fontSize(9).fillColor("#0f172a").text(`${p.title} ${p.fName} ${p.lName}`, colX[0], y, { width: colW[0] });
      doc.fillColor(muted);
      doc.text(TYPE_LABEL[p.pType] ?? p.pType, colX[1], y, { width: colW[1] });
      doc.text(p.ticketNo ?? "—", colX[2], y, { width: colW[2] });
      doc.text(p.pnr ?? "—", colX[3], y, { width: colW[3] });
      y = doc.y + 8;
    }

    if (data.fare) {
      y += 6;
      doc.fontSize(9).fillColor(muted).text("FARE SUMMARY", left, y, { width: pageWidth });
      y = doc.y + 4;
      const providerFare = data.providerFareAmount ?? data.fare.total;
      const addons = Math.max(0, data.totalAmount - providerFare);
      const taxes = data.fare.tax + data.fare.tds;
      const parts = [`Base fare: ${data.currency} ${data.fare.base.toLocaleString("en-IN")}`, `Taxes & charges: ${data.currency} ${taxes.toLocaleString("en-IN")}`];
      if (addons > 0) parts.push(`Add-ons: ${data.currency} ${addons.toLocaleString("en-IN")}`);
      doc.fontSize(9).fillColor("#0f172a").text(parts.join("   |   "), left, y, { width: pageWidth });
      y = doc.y;
    }

    y += 10;
    doc.fontSize(12).fillColor("#0f172a").text(`Total paid: ${data.currency} ${data.totalAmount.toLocaleString("en-IN")}`, left, y, { width: pageWidth, align: "right" });
    y = doc.y + 18;

    doc
      .fontSize(7.5)
      .fillColor("#94a3b8")
      .text(
        "Please carry a valid photo ID matching the passenger name(s) above. Arrive at the airport at least 2 hours before domestic departure. This document is proof of your booking with Paxbook and the airline named above — it is not a boarding pass.",
        left,
        y,
        { width: pageWidth },
      );

    doc.end();
  });
}
