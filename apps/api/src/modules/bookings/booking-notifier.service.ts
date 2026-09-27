import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import { renderEmail, type EmailContent } from "../../common/email/email-layout";

type BookingEvent =
  | { kind: "request_received" }
  | { kind: "payment_received"; amount: number }
  | { kind: "confirmed" }
  | { kind: "status_changed"; toStatus: string; note?: string }
  | { kind: "cancellation_requested"; reason?: string }
  | { kind: "cancellation_resolved"; approved: boolean; note?: string };

/**
 * Customer emails for tour/package bookings, one place for every lifecycle event so they all share
 * the branded layout and the same booking facts (reference, package, dates, amount).
 * Best-effort by design: a mail failure is logged and never breaks the booking action itself.
 */
@Injectable()
export class BookingNotifier {
  private readonly logger = new Logger(BookingNotifier.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async notify(tenantId: string, bookingId: string, event: BookingEvent): Promise<void> {
    try {
      const booking = await this.prisma.booking.findFirst({
        where: { id: bookingId, tenantId },
        include: { customer: { select: { name: true, email: true } }, package: { select: { title: true } } },
      });
      if (!booking?.customer?.email) return;

      const frontendUrl = this.config.get<string>("FRONTEND_URL", "http://localhost:3001");
      const bookingUrl = `${frontendUrl}/account/bookings/${booking.id}`;
      const ref = `PB-${booking.id.slice(0, 8).toUpperCase()}`;
      const money = (n: number) => `${booking.currency} ${n.toLocaleString("en-IN")}`;
      const date = (d: Date | null) => (d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "To be confirmed");
      const facts: Array<[string, string]> = [
        ["Booking reference", ref],
        ["Package", booking.package?.title ?? "Holiday package"],
        ["Travel dates", booking.travelEndDate ? `${date(booking.travelStartDate)} – ${date(booking.travelEndDate)}` : date(booking.travelStartDate)],
        ["Total amount", money(booking.totalAmount.toNumber())],
      ];
      const base = { recipientName: booking.customer.name, details: facts, cta: { label: "View booking", url: bookingUrl } };
      const pkg = booking.package?.title ?? "your trip";

      const byEvent: Record<BookingEvent["kind"], () => { subject: string; content: EmailContent }> = {
        request_received: () => ({
          subject: `Booking request received — ${pkg} (${ref})`,
          content: {
            ...base,
            preheader: `We've received your booking request for ${pkg}. Complete payment to confirm it.`,
            eyebrow: "Holiday booking",
            title: "We've received your booking request",
            status: { label: "Awaiting payment", tone: "warning" },
            paragraphs: ["Thanks for choosing Paxbook. Your booking is reserved as a request — complete the payment from your account to confirm it. A travel expert may call you to fine-tune the itinerary."],
            cta: { label: "Pay & confirm", url: bookingUrl },
          },
        }),
        payment_received: () => ({
          subject: `Payment received — ${ref}`,
          content: {
            ...base,
            preheader: `We've received your payment of ${money(event.kind === "payment_received" ? event.amount : 0)}.`,
            eyebrow: "Payment",
            title: "Payment received",
            status: { label: "Payment received", tone: "success" },
            paragraphs: [`We've received your payment of ${money(event.kind === "payment_received" ? event.amount : 0)}. Thank you!`],
          },
        }),
        confirmed: () => ({
          subject: `Your booking is confirmed — ${pkg} (${ref})`,
          content: {
            ...base,
            preheader: `${pkg} is confirmed. Your invoice and travel voucher are ready.`,
            eyebrow: "Holiday booking",
            title: "Your booking is confirmed",
            status: { label: "Confirmed", tone: "success" },
            paragraphs: ["Your booking is fully paid and confirmed. Your invoice and travel voucher are ready to download from your account."],
            cta: { label: "View voucher & invoice", url: bookingUrl },
            note: "Carry your voucher (printed or on your phone) when you travel.",
          },
        }),
        status_changed: () => {
          const s = event.kind === "status_changed" ? event : { toStatus: "", note: undefined };
          const map: Record<string, { title: string; label: string; tone: "success" | "info" | "danger" | "warning"; line: string }> = {
            CONFIRMED: { title: "Your booking is confirmed", label: "Confirmed", tone: "success", line: "Our team has confirmed your booking." },
            COMPLETED: { title: "Welcome back! Your trip is complete", label: "Completed", tone: "info", line: "We hope you had a wonderful trip. We'd love to hear about it — you can leave a review from your account." },
            CANCELLED: { title: "Your booking has been cancelled", label: "Cancelled", tone: "danger", line: "Your booking has been cancelled. If a refund is due, our team will process it to your original payment method." },
            DRAFT: { title: "Your booking has been updated", label: "Pending", tone: "warning", line: "Your booking has been moved back to pending by our team." },
          };
          const m = map[s.toStatus] ?? map.DRAFT!;
          return {
            subject: `${m.title} — ${ref}`,
            content: {
              ...base,
              preheader: `${m.line}`,
              eyebrow: "Booking update",
              title: m.title,
              status: { label: m.label, tone: m.tone },
              paragraphs: [m.line, ...(s.note ? [`Note from our team: ${s.note}`] : [])],
            },
          };
        },
        cancellation_requested: () => ({
          subject: `Cancellation request received — ${ref}`,
          content: {
            ...base,
            preheader: "We've received your cancellation request and will review it shortly.",
            eyebrow: "Cancellation",
            title: "We've received your cancellation request",
            status: { label: "Under review", tone: "warning" },
            paragraphs: [
              "Our team will review your request and email you the outcome, including any refund, usually within 1–2 working days.",
              ...(event.kind === "cancellation_requested" && event.reason ? [`Your reason: ${event.reason}`] : []),
            ],
          },
        }),
        cancellation_resolved: () => {
          const r = event.kind === "cancellation_resolved" ? event : { approved: false, note: undefined };
          return {
            subject: `${r.approved ? "Cancellation approved" : "Cancellation request declined"} — ${ref}`,
            content: {
              ...base,
              preheader: r.approved ? "Your booking has been cancelled." : "Your cancellation request was not approved.",
              eyebrow: "Cancellation",
              title: r.approved ? "Your cancellation has been approved" : "Your cancellation request was declined",
              status: r.approved ? { label: "Cancelled", tone: "danger" } : { label: "Booking still active", tone: "info" },
              paragraphs: [
                r.approved
                  ? "Your booking has been cancelled. If a refund is due, it will go back to your original payment method (banks usually take 5–7 working days)."
                  : "Your booking remains active. Reply to this email if you'd like to discuss it with our team.",
                ...(r.note ? [`Note from our team: ${r.note}`] : []),
              ],
            },
          };
        },
      };

      const { subject, content } = byEvent[event.kind]();
      const result = await this.email.send(tenantId, booking.customer.email, subject, renderEmail(content));
      if (!result.sent) this.logger.debug(`Booking email (${event.kind}) not sent: ${result.reason}`);
    } catch (err) {
      this.logger.warn(`Booking email (${event.kind}) failed for ${bookingId}: ${(err as Error).message}`);
    }
  }
}
