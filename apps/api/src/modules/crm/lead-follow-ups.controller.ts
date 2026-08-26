import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { LeadFollowUpsService } from "./lead-follow-ups.service";
import { SaveLeadFollowUpDto } from "./dto/save-lead-follow-up.dto";

@ApiTags("crm")
@ApiBearerAuth()
@Controller({ path: "leads/:leadId/follow-ups", version: "1" })
export class LeadFollowUpsController {
  constructor(private readonly leadFollowUpsService: LeadFollowUpsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Param("leadId") leadId: string, @Body() dto: SaveLeadFollowUpDto) {
    return this.leadFollowUpsService.create(admin.tenantId, leadId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("leadId") leadId: string, @Param("id") id: string, @Body() dto: SaveLeadFollowUpDto) {
    return this.leadFollowUpsService.update(admin.tenantId, leadId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("leadId") leadId: string, @Param("id") id: string) {
    await this.leadFollowUpsService.remove(admin.tenantId, leadId, id);
    return { id };
  }
}
