import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { LeadsService } from "../crm/leads.service";
import { LeadFollowUpsService } from "../crm/lead-follow-ups.service";
import { SaveLeadInquiryDto } from "./dto/save-lead-inquiry.dto";
import { EmailService } from "../../common/email/email.service";
import { renderEmail, SUPPORT_EMAIL } from "../../common/email/email-layout";
import { PrismaService } from "../../common/prisma/prisma.service";

const NEWSLETTER_NAME = "Newsletter Subscriber";
const TRIP_CUSTOMIZER = "Trip Customizer";
// Only these known wizard values are ever repeated back to the visitor in their email.
const KNOWN_DURATIONS = new Set(["2 – 3 Days", "4 – 6 Days", "7 – 10 Days", "10 – 15 Days"]);
const KNOWN_STAYS = new Set(["Value", "Comfort", "Luxury"]);
const KNOWN_PACES = new Set(["Relaxed", "Balanced", "Packed"]);

/// Public inquiry form -> Lead, reusing CrmModule's LeadsService rather than duplicating creation logic.
@ApiTags("public")
@Public()
@Controller({ path: "public/leads", version: "1" })
export class PublicLeadsController {
  private readonly logger = new Logger(PublicLeadsController.name);

  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadFollowUpsService: LeadFollowUpsService,
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  async create(@CurrentTenant() tenant: ResolvedTenant, @Body() dto: SaveLeadInquiryDto) {
    const lead = await this.leadsService.create(tenant.id, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      source: dto.source ?? "Website",
      destinationInterest: dto.destinationInterest,
      travellerType: dto.travellerType,
      interests: dto.interests,
      tripDuration: dto.tripDuration,
      departureCity: dto.departureCity,
      departureDate: dto.departureDate,
      packageId: dto.packageId,
      travellerCount: dto.travellerCount,
      stayType: dto.stayType,
      travelPace: dto.travelPace,
    });

    if (dto.message) {
      await this.leadFollowUpsService.create(tenant.id, lead.id, {
        scheduledAt: new Date().toISOString(),
        notes: dto.message,
        method: "Website Inquiry",
      });
    }

    if (dto.email) await this.acknowledge(tenant.id, dto, lead.packageTitle);
    if (dto.name !== NEWSLETTER_NAME) await this.notifyTeam(tenant.id, lead);

    return { id: lead.id };
  }

  /**
   * Reply to the visitor. Fixed wording on purpose: this endpoint is public, so free text the visitor
   * typed is never echoed back (that would let anyone use the form to mail arbitrary text). The trip
   * summary only repeats values from the wizard's fixed lists, and the destination only if it exists.
   */
  private async acknowledge(tenantId: string, dto: SaveLeadInquiryDto, packageTitle: string | null): Promise<void> {
    const to = dto.email!;
    const isNewsletter = dto.name === NEWSLETTER_NAME;
    const name = isNewsletter ? null : dto.name.slice(0, 60);
    if (isNewsletter) {
      const body = renderEmail({
        preheader: "You're on the list — new journeys and offers, no spam.",
        eyebrow: "Newsletter",
        title: "You're subscribed",
        paragraphs: ["Thanks for subscribing to Paxbook. We'll send you new journeys, seasonal ideas and the occasional offer — never more than a few emails a month."],
        note: "Not you? Reply to this email and we'll remove this address.",
      });
      await this.email.send(tenantId, to, "Welcome to Paxbook travel updates", body).catch(() => undefined);
      return;
    }

    if (dto.source === TRIP_CUSTOMIZER) {
      const destination = dto.destinationInterest
        ? await this.prisma.destination.findFirst({ where: { tenantId, deletedAt: null, name: { equals: dto.destinationInterest, mode: "insensitive" } }, select: { name: true } })
        : null;
      const details: Array<[string, string]> = [];
      if (destination) details.push(["Destination", destination.name]);
      if (dto.travellerCount) details.push(["Travellers", String(dto.travellerCount)]);
      if (dto.tripDuration && KNOWN_DURATIONS.has(dto.tripDuration)) details.push(["Duration", dto.tripDuration]);
      if (dto.stayType && KNOWN_STAYS.has(dto.stayType)) details.push(["Stay", dto.stayType]);
      if (dto.travelPace && KNOWN_PACES.has(dto.travelPace)) details.push(["Pace", dto.travelPace]);
      if (dto.departureDate) details.push(["Departure", new Date(dto.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })]);
      if (packageTitle) details.push(["Starting package", packageTitle]);
      const body = renderEmail({
        preheader: "Welcome to Paxbook — your travel expert is already on it.",
        eyebrow: "Welcome to Paxbook",
        title: destination ? `Your ${destination.name} trip is in good hands` : "Your trip is in good hands",
        recipientName: name,
        status: { label: "Request received", tone: "info" },
        paragraphs: [
          "Thank you for planning your holiday with Paxbook. A travel expert is reviewing your choices and will call you shortly with a custom itinerary and the best available prices.",
          "There's nothing to pay yet. Once you like the plan, we'll hold your hotels and flights and guide you through every step.",
          "Questions in the meantime? Call or WhatsApp us on +91 73000 47077.",
        ],
        details,
        note: "Didn't plan a trip with us? You can safely ignore this email.",
      });
      await this.email.send(tenantId, to, "Welcome to Paxbook — we're planning your trip", body).catch(() => undefined);
      return;
    }

    const body = renderEmail({
      preheader: "Thanks — a Paxbook travel expert will get back to you shortly.",
      eyebrow: "Enquiry received",
      title: "Thanks, we've got your enquiry",
      recipientName: name,
      status: { label: "Received", tone: "info" },
      paragraphs: [
        "A Paxbook travel expert will review your details and get back to you, usually within a few working hours.",
        "In a hurry? Call us on +91 73000 47077 and mention your name.",
      ],
      note: "Didn't send an enquiry? You can safely ignore this email.",
    });
    await this.email.send(tenantId, to, "We've received your enquiry — Paxbook", body).catch(() => undefined);
  }

  /**
   * New-enquiry alert for the team: every detail of the lead plus a button to open it in the admin
   * panel. Goes to LEADS_NOTIFY_EMAIL (comma-separated), or the planners mailbox when unset.
   */
  private async notifyTeam(tenantId: string, lead: Awaited<ReturnType<LeadsService["create"]>>): Promise<void> {
    const recipients = (this.config.get<string>("LEADS_NOTIFY_EMAIL") || SUPPORT_EMAIL)
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const adminUrl =
      this.config.get<string>("ADMIN_URL") ||
      (this.config.get<string>("CORS_ORIGINS") ?? "").split(",").map((o) => o.trim()).find((o) => /admin/i.test(o)) ||
      "http://localhost:3000";
    const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
    const details: Array<[string, string]> = (
      [
        ["Name", lead.name],
        ["Email", lead.email ?? ""],
        ["Mobile", lead.phone ?? ""],
        ["Source", lead.source ?? ""],
        ["Destination", lead.destinationInterest ?? ""],
        ["Traveller type", lead.travellerType ?? ""],
        ["Travellers", lead.travellerCount ? String(lead.travellerCount) : ""],
        ["Travel vibe", lead.interests.join(", ")],
        ["Duration", lead.tripDuration ?? ""],
        ["Stay", lead.stayType ?? ""],
        ["Pace", lead.travelPace ?? ""],
        ["Flying from", lead.departureCity ?? ""],
        ["Departure", date(lead.departureDate)],
        ["Package", lead.packageTitle ?? ""],
        ["Received", new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })],
      ] as Array<[string, string]>
    ).filter(([, v]) => v);
    const body = renderEmail({
      preheader: `New ${lead.source ?? "website"} enquiry from ${lead.name}`,
      eyebrow: "New enquiry",
      title: lead.destinationInterest ? `${lead.name} wants a ${lead.destinationInterest} trip` : `New enquiry from ${lead.name}`,
      status: { label: lead.source ?? "Website", tone: "info" },
      paragraphs: ["A new enquiry just came in from the website. Call the customer soon while they're still planning."],
      details,
      cta: { label: "Open in admin panel", url: `${adminUrl.replace(/\/$/, "")}/crm/leads/${lead.id}` },
      note: "You get this email for every new website enquiry.",
    });
    const subject = `New enquiry: ${lead.name}${lead.destinationInterest ? ` · ${lead.destinationInterest}` : ""}`.slice(0, 120);
    for (const to of recipients) {
      const result = await this.email.send(tenantId, to, subject, body).catch(() => ({ sent: false, reason: "send threw" }));
      if (!result.sent) this.logger.warn(`Lead alert to ${to} not sent: ${result.reason}`);
    }
  }
}
