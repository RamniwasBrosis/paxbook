import PDFDocument from "pdfkit";
import bwipjs from "bwip-js";
import type { FlightBookingStatus, FlightFareDto, FlightLegDto, FlightTicketDto } from "@paxbook/types";
import { extractFlightSnapshot } from "./flight-response-mapper";

const SUPPORT = { phone: "+91 73000 47077", email: "planners@paxbook.in" };
const TYPE_LABEL: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };
const CABIN_LABEL: Record<string, string> = { E: "Economy", P: "Premium Economy", B: "Business", F: "First" };

/** Airline sites for web check-in (the boarding pass comes from the airline, not from us). */
const WEB_CHECKIN: Record<string, string> = {
  "6E": "https://www.goindigo.in",
  AI: "https://www.airindia.com",
  IX: "https://www.airindiaexpress.com",
  QP: "https://www.akasaair.com",
  SG: "https://www.spicejet.com",
  UK: "https://www.airindia.com",
};

export interface TicketSource {
  id: string;
  status: string;
  pnr: string | null;
  createdAt: Date;
  fareSnapshot: unknown;
  totalAmount: { toNumber(): number };
  couponCode?: string | null;
  discountAmount?: { toNumber(): number } | null;
  currency: string;
  passengers: Array<{ title: string; fName: string; lName: string; pType: string; ticketNo: string | null; pnr: string | null }>;
}

interface SnapshotExtras {
  _bookingInput?: { email?: string; mobile?: string; webCheckin?: boolean };
  _resolvedSsr?: Array<Record<string, { baggage?: { amount?: number }; meals?: Array<{ amount?: number }>; seat?: { seatAmt?: number } } | undefined>>;
  ssr?: { webCheckinAmount?: number } | null;
}

/** PDF417 settings shared by the web (SVG) and PDF (PNG) barcodes; `columns` is a PDF417 option bwip-js' types don't list. */
function pdf417(text: string): bwipjs.RenderOptions {
  return { bcid: "pdf417", text, rowmult: 2, paddingwidth: 0, columns: 6 } as bwipjs.RenderOptions;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function cleanBaggage(raw: string | null | undefined): string {
  const parts = [...new Set((raw ?? "").split("|").map((p) => p.trim()).filter(Boolean))];
  return parts.length ? parts.map((p) => p.replace(/(\d+)\s*Pcs?\b/i, (_m, n: string) => `${n} Piece${n === "1" ? "" : "s"}`)).join(" / ") : "As per airline";
}

/** Builds everything the e-ticket shows from the booking as stored (frozen fare snapshot + passengers). */
export function buildTicket(b: TicketSource): FlightTicketDto {
  const { legs, returnLegs, fare } = extractFlightSnapshot(b.fareSnapshot);
  const extras = (b.fareSnapshot ?? {}) as SnapshotExtras;
  const bookingRef = `PXB${b.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  const direction = (label: string, segs: FlightLegDto[], f: FlightFareDto | null) => {
    const first = segs[0]!;
    const last = segs[segs.length - 1]!;
    return {
      label,
      fromCity: first.depCityName,
      toCity: last.arrCityName,
      route: `${first.depCode}-${last.arrCode}`,
      airlineCode: first.airlineCode,
      airlineName: first.airlineName,
      pnr: b.pnr,
      refundable: Boolean(f?.refundable),
      cabin: CABIN_LABEL[first.cabin] ?? first.cabin,
      fareType: f?.fareTypeLabel || null,
      webCheckinUrl: WEB_CHECKIN[first.airlineCode] ?? null,
      segments: segs,
    };
  };
  const directions = [
    ...(legs.length ? [direction("Departure", legs, fare)] : []),
    ...(returnLegs?.length ? [direction("Return", returnLegs, fare)] : []),
  ];

  const passengers = b.passengers.map((p) => {
    const name = `${p.title} ${p.fName} ${p.lName}`.replace(/\s+/g, " ").trim();
    const sectors = directions.map((d) => ({ route: d.route, pnr: p.pnr ?? b.pnr, ticketNo: p.ticketNo }));
    const first = directions[0]?.segments[0];
    const barcodeText = [bookingRef, p.pnr ?? b.pnr ?? "PENDING", p.ticketNo ?? "-", `${p.lName}/${p.fName}`.toUpperCase(), directions.map((d) => d.route).join(" "), first ? `${first.airlineCode}${first.flightNo}` : "", first ? first.depDateTime.slice(0, 10) : ""].join("|");
    return {
      name,
      type: TYPE_LABEL[p.pType] ?? p.pType,
      sectors,
      baggage: { cabin: cleanBaggage(fare?.baggageCabin), checkIn: p.pType === "I" ? "No free allowance" : cleanBaggage(fare?.baggageCheckIn) },
      barcodeText,
      barcodeSvg: bwipjs.toSVG(pdf417(barcodeText)),
    };
  });

  // Add-ons as priced and stored when the booking was made.
  let baggageAndMeals = 0;
  let seats = 0;
  for (const pax of extras._resolvedSsr ?? []) {
    for (const leg of Object.values(pax ?? {})) {
      if (!leg) continue;
      baggageAndMeals += leg.baggage?.amount ?? 0;
      for (const m of leg.meals ?? []) baggageAndMeals += m.amount ?? 0;
      seats += leg.seat?.seatAmt ?? 0;
    }
  }
  const webCheckin = extras._bookingInput?.webCheckin ? (extras.ssr?.webCheckinAmount ?? 0) : 0;
  const discount = b.discountAmount ? b.discountAmount.toNumber() : 0;
  const grandTotal = b.totalAmount.toNumber();
  const fareTotal = fare?.total ?? round2(grandTotal + discount - baggageAndMeals - seats - webCheckin);
  const base = fare?.base ?? fareTotal;

  return {
    bookingRef,
    bookedAt: b.createdAt.toISOString(),
    status: b.status as FlightBookingStatus,
    pnr: b.pnr,
    support: SUPPORT,
    contact: { email: extras._bookingInput?.email ?? null, mobile: extras._bookingInput?.mobile ?? null },
    directions,
    passengers,
    fare: {
      base: round2(base),
      taxes: round2(fareTotal - base),
      fareTotal: round2(fareTotal),
      baggageAndMeals: round2(baggageAndMeals),
      seats: round2(seats),
      webCheckin: round2(webCheckin),
      couponCode: b.couponCode ?? null,
      discount: round2(discount),
      grandTotal: round2(grandTotal),
      currency: b.currency,
    },
  };
}

function dt(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ (\d{2})$/, "'$1"),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

function hm(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function money(n: number, currency: string): string {
  return `${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * The PDF e-ticket (pdfkit, no headless browser), laid out like an airline/OTA ticket: header with
 * booking ID and support, PNR status card, flight table, passenger table with a PDF417 barcode each,
 * contact, fare breakup, checklist and terms. Standard PDF fonts lack "₹" and "→", so it uses "INR"
 * and "->". Every text call passes an explicit x/width (pdfkit's cursor otherwise drifts).
 */
export async function buildTicketPdf(t: FlightTicketDto): Promise<Buffer> {
  const barcodes = await Promise.all(
    t.passengers.map((p) =>
      bwipjs
        .toBuffer({ ...pdf417(p.barcodeText), scale: 2 } as bwipjs.RenderOptions)
        .catch(() => null),
    ),
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const navy = "#122a63";
    const brand = "#1b3f8f";
    const ink = "#0f172a";
    const muted = "#64748b";
    const line = "#e2e8f0";
    const soft = "#f1f5f9";
    const green = "#15803d";
    const L = doc.page.margins.left;
    const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const bottom = doc.page.height - doc.page.margins.bottom;
    let y = doc.page.margins.top;
    const need = (h: number) => {
      if (y + h > bottom - 20) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    };
    const heading = (txt: string) => {
      need(40);
      doc.font("Helvetica-Bold").fontSize(13).fillColor(navy).text(txt, L, y, { width: W });
      y = doc.y + 8;
    };

    // Header
    doc.roundedRect(L, y, 44, 44, 8).fill(navy);
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#f5b73d").text("P", L, y + 10, { width: 44, align: "center" });
    doc.font("Helvetica-Bold").fontSize(16).fillColor(navy).text("Paxbook", L + 56, y + 2, { width: 220 });
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(`Booking ID: ${t.bookingRef}`, L + 56, y + 22, { width: 240 });
    doc.text(`Booking date: ${new Date(t.bookedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, L + 56, y + 34, { width: 240 });
    doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text("Need help with your trip?", L + W - 200, y + 2, { width: 200, align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(t.support.email, L + W - 200, y + 18, { width: 200, align: "right" });
    doc.fillColor(brand).text(t.support.phone, L + W - 200, y + 30, { width: 200, align: "right" });
    y += 60;

    // PNR status cards (one per direction)
    for (const d of t.directions) {
      need(64);
      const confirmed = t.status === "CONFIRMED";
      doc.roundedRect(L, y, W, 54, 8).lineWidth(1).strokeColor(line).stroke();
      doc.font("Helvetica").fontSize(9).fillColor(muted).text(`${d.label} · ${d.airlineName}`, L + 14, y + 9, { width: W / 2 });
      doc.font("Helvetica-Bold").fontSize(14).fillColor(ink).text(d.route, L + 14, y + 21, { width: W / 2 });
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(confirmed ? green : "#b45309")
        .text(`${d.pnr ?? "PNR pending"}   ${t.status.replace(/_/g, " ")}`, L + 14, y + 38, { width: W / 2 + 40 });
      if (d.webCheckinUrl) {
        doc.font("Helvetica").fontSize(9).fillColor(brand).text("Web check-in on airline site", L + W - 180, y + 22, { width: 166, align: "right", link: d.webCheckinUrl, underline: true });
      }
      y += 64;
    }

    // Flight details
    heading("Flight details");
    for (const d of t.directions) {
      need(30);
      doc.rect(L, y, W, 24).fill(soft);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(brand).text(`${d.fromCity}  ->  ${d.toCity}`, L + 10, y + 7, { width: W - 160 });
      doc.font("Helvetica").fontSize(9).fillColor(d.refundable ? green : "#b91c1c").text(d.refundable ? "Refundable (fees apply)" : "Non-refundable", L + W - 150, y + 8, { width: 140, align: "right" });
      y += 28;
      const cols = [L + 10, L + 120, L + 210, L + 345, L + W - 50];
      for (const s of d.segments) {
        need(58);
        const dep = dt(s.depDateTime);
        const arr = dt(s.arrDateTime);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(s.airlineName, cols[0], y, { width: 105 });
        doc.font("Helvetica").fontSize(9).fillColor(muted).text(`${s.airlineCode}-${s.flightNo}`, cols[0], y + 13, { width: 105 });
        doc.text(`${d.cabin}${d.fareType ? `, ${d.fareType}` : ""}`, cols[1], y, { width: 85 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text("Departing", cols[2], y, { width: 130 });
        doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text(`${dep.date} - ${dep.time}`, cols[2], y + 10, { width: 130 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text(`${s.depCode} ${s.depAirportName}${s.depTerminal ? `, Terminal ${s.depTerminal}` : ""}`, cols[2], y + 25, { width: 130 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text("Arriving", cols[3], y, { width: 130 });
        doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text(`${arr.date} - ${arr.time}`, cols[3], y + 10, { width: 130 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text(`${s.arrCode} ${s.arrAirportName}${s.arrTerminal ? `, Terminal ${s.arrTerminal}` : ""}`, cols[3], y + 25, { width: 130 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text("Duration", cols[4], y, { width: 50, align: "right" });
        doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(hm(s.durationMinutes), cols[4], y + 10, { width: 50, align: "right" });
        y += 52;
        doc.moveTo(L, y - 6).lineTo(L + W, y - 6).lineWidth(0.5).strokeColor(line).stroke();
      }
      y += 4;
    }

    // Passengers
    heading("Passenger details");
    const [pc0, pc1, pc2, pc3, pc4] = [L, L + 24, L + 170, L + 280, L + 440];
    need(22);
    doc.rect(L, y, W, 20).fill(soft);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(muted);
    doc.text("#", pc0 + 8, y + 6, { width: 14 });
    doc.text("NAME", pc1, y + 6, { width: 140 });
    doc.text("SECTOR PNR (TICKET NO.)", pc2, y + 6, { width: 108 });
    doc.text("BARCODE", pc3, y + 6, { width: 150 });
    doc.text("BAGGAGE", pc4, y + 6, { width: L + W - pc4 });
    y += 24;
    t.passengers.forEach((p, i) => {
      need(64);
      doc.font("Helvetica").fontSize(9).fillColor(ink).text(String(i + 1), pc0 + 8, y + 4, { width: 14 });
      doc.font("Helvetica-Bold").fontSize(9).fillColor(ink).text(p.name.toUpperCase(), pc1, y + 4, { width: 140 });
      doc.font("Helvetica").fontSize(8).fillColor(muted).text(`(${p.type})`, pc1, doc.y + 1, { width: 140 });
      let sy = y + 4;
      for (const s of p.sectors) {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(ink).text(s.route.replace("-", " "), pc2, sy, { width: 108 });
        doc.font("Helvetica-Bold").fontSize(9).fillColor(green).text(s.pnr ?? "Pending", pc2, doc.y, { width: 108 });
        doc.font("Helvetica").fontSize(8).fillColor(muted).text(s.ticketNo ? `(${s.ticketNo})` : "", pc2, doc.y, { width: 108 });
        sy = doc.y + 4;
      }
      const png = barcodes[i];
      if (png) doc.image(png, pc3, y + 2, { fit: [150, 50] });
      doc.font("Helvetica").fontSize(8).fillColor(ink).text(`Cabin: ${p.baggage.cabin}`, pc4, y + 4, { width: L + W - pc4 });
      doc.text(`Check-in: ${p.baggage.checkIn}`, pc4, doc.y + 2, { width: L + W - pc4 });
      y = Math.max(y + 58, sy);
      doc.moveTo(L, y - 4).lineTo(L + W, y - 4).lineWidth(0.5).strokeColor(line).stroke();
    });

    // Contact
    heading("Traveller information");
    need(26);
    doc.rect(L, y, W, 22).lineWidth(0.5).strokeColor(line).stroke();
    doc.font("Helvetica").fontSize(9).fillColor(muted).text("Email:", L + 10, y + 7, { width: 40 });
    doc.fillColor(ink).text(t.contact.email ?? "—", L + 44, y + 7, { width: W / 2 - 54 });
    doc.fillColor(muted).text("Mobile:", L + W / 2 + 10, y + 7, { width: 44 });
    doc.fillColor(ink).text(t.contact.mobile ?? "—", L + W / 2 + 54, y + 7, { width: W / 2 - 64 });
    y += 34;

    // Fare breakup
    heading("Fare breakup");
    const f = t.fare;
    const rows: Array<[string, number, boolean?]> = [
      ["Base fare", f.base],
      ["Tax & surcharges", f.taxes],
      ["Total fare", f.fareTotal, true],
      ["Baggage & meals", f.baggageAndMeals],
      ["Seats", f.seats],
      ["Web check-in", f.webCheckin],
    ];
    const fw = Math.min(W, 340);
    for (const [label, amount, bold] of rows) {
      need(20);
      doc.rect(L, y, fw, 19).fill(bold ? soft : "#ffffff");
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(ink).text(label, L + 10, y + 5, { width: fw / 2 });
      doc.text(money(amount, f.currency), L + fw / 2, y + 5, { width: fw / 2 - 10, align: "right" });
      y += 19;
      doc.moveTo(L, y).lineTo(L + fw, y).lineWidth(0.5).strokeColor(line).stroke();
    }
    if (f.discount > 0) {
      doc.font("Helvetica").fontSize(9).fillColor(green).text(`Coupon ${f.couponCode ?? ""}`, L + 10, y + 5, { width: fw / 2 });
      doc.text(`- ${money(f.discount, f.currency)}`, L + fw / 2, y + 5, { width: fw / 2 - 10, align: "right" });
      y += 19;
      doc.moveTo(L, y).lineTo(L + fw, y).lineWidth(0.5).strokeColor(line).stroke();
    }
    need(26);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(ink).text("Grand total", L + 10, y + 7, { width: fw / 2 });
    doc.text(money(f.grandTotal, f.currency), L + fw / 2, y + 7, { width: fw / 2 - 10, align: "right" });
    y += 34;

    // Checklist + terms
    heading("Mandatory check-list for passengers");
    doc.font("Helvetica").fontSize(9).fillColor(ink);
    for (const item of ["1) Complete your web check-in on the airline's website or app before reaching the airport.", "2) Report at the airport at least 2 hours before domestic and 3 hours before international departures."]) {
      need(16);
      doc.text(item, L, y, { width: W });
      y = doc.y + 3;
    }
    y += 8;
    heading("Terms & conditions");
    const terms = [
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
    const half = (W - 12) / 2;
    for (let i = 0; i < terms.length; i += 2) {
      const a = terms[i]!;
      const b2 = terms[i + 1];
      doc.font("Helvetica").fontSize(8.5);
      const h = Math.max(doc.heightOfString(a, { width: half - 16 }), b2 ? doc.heightOfString(b2, { width: half - 16 }) : 0) + 12;
      need(h + 2);
      doc.rect(L, y, half, h).lineWidth(0.5).strokeColor(line).stroke();
      doc.fillColor(ink).text(a, L + 8, y + 6, { width: half - 16 });
      if (b2) {
        doc.rect(L + half + 12, y, half, h).lineWidth(0.5).strokeColor(line).stroke();
        doc.fillColor(ink).text(b2, L + half + 20, y + 6, { width: half - 16 });
      }
      y += h + 4;
    }
    y += 14;
    need(20);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(navy).text("Have a nice trip!", L, y, { width: W, align: "center" });

    // Footer on every page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      // Writing below the bottom margin would make pdfkit start a new page.
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#94a3b8")
        .text(`Paxbook e-ticket · Booking ID ${t.bookingRef}`, L, doc.page.height - 28, { width: W / 2, lineBreak: false });
      doc.text(`Page ${i + 1} of ${pages.count}`, L + W / 2, doc.page.height - 28, { width: W / 2, align: "right", lineBreak: false });
      doc.page.margins.bottom = savedBottom;
    }
    doc.end();
  });
}
