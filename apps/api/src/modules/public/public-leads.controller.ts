import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { ResolvedTenant } from "../../common/types/resolved-tenant";
import { LeadsService } from "../crm/leads.service";
import { LeadFollowUpsService } from "../crm/lead-follow-ups.service";
import { SaveLeadInquiryDto } from "./dto/save-lead-inquiry.dto";

/// Public inquiry form -> Lead, reusing CrmModule's LeadsService rather than duplicating creation logic.
@ApiTags("public")
@Public()
@Controller({ path: "public/leads", version: "1" })
export class PublicLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadFollowUpsService: LeadFollowUpsService,
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

    return { id: lead.id };
  }
}
