import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { LeadsService } from "./leads.service";
import { SaveLeadDto } from "./dto/save-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";

@ApiTags("crm")
@ApiBearerAuth()
@Controller({ path: "leads", version: "1" })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CRM_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.leadsService.findAll(admin.tenantId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.CRM_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.leadsService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveLeadDto) {
    return this.leadsService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveLeadDto) {
    return this.leadsService.update(admin.tenantId, id, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  setStatus(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leadsService.setStatus(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CRM_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.leadsService.remove(admin.tenantId, id);
    return { id };
  }
}
