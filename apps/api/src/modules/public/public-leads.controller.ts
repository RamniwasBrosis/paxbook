import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { LeadsService } from "../crm/leads.service";
import { LeadFollowUpsService } from "../crm/lead-follow-ups.service";
import { SaveLeadInquiryDto } from "./dto/save-lead-inquiry.dto";
import { EmailService } from "../../common/email/email.service";
import { renderEmail } from "../../common/email/email-layout";

const NEWSLETTER_NAME = "Newsletter Subscriber";

/// Public inquiry form -> Lead, reusing CrmModule's LeadsService rather than duplicating creation logic.
@ApiTags("public")
@Public()
@Controller({ path: "public/leads", version: "1" })
export class PublicLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadFollowUpsService: LeadFollowUpsService,
    private readonly email: EmailService,
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
    });

    if (dto.message) {
      await this.leadFollowUpsService.create(tenant.id, lead.id, {
        scheduledAt: new Date().toISOString(),
        notes: dto.message,
        method: "Website Inquiry",
      });
    }

    if (dto.email) await this.acknowledge(tenant.id, dto.email, dto.name);

    return { id: lead.id };
  }

  /**
   * Standard "we got it" reply. Fixed wording on purpose: this endpoint is public, so the visitor's
   * own message is never echoed back (that would let anyone use the form to mail arbitrary text).
   */
  private async acknowledge(tenantId: string, to: string, rawName: string): Promise<void> {
    const isNewsletter = rawName === NEWSLETTER_NAME;
    const name = isNewsletter ? null : rawName.slice(0, 60);
    const body = isNewsletter
      ? renderEmail({
          preheader: "You're on the list — new journeys and offers, no spam.",
          eyebrow: "Newsletter",
          title: "You're subscribed",
          paragraphs: ["Thanks for subscribing to Paxbook. We'll send you new journeys, seasonal ideas and the occasional offer — never more than a few emails a month."],
          note: "Not you? Reply to this email and we'll remove this address.",
        })
      : renderEmail({
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
    await this.email.send(tenantId, to, isNewsletter ? "Welcome to Paxbook travel updates" : "We've received your enquiry — Paxbook", body).catch(() => undefined);
  }
}
