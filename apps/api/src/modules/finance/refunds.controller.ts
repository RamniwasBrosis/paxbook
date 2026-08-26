import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { RefundsService } from "./refunds.service";
import { SaveRefundDto } from "./dto/save-refund.dto";
import { UpdateRefundStatusDto } from "./dto/update-refund-status.dto";

@ApiTags("finance")
@ApiBearerAuth()
@Controller({ path: "refunds", version: "1" })
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.refundsService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveRefundDto) {
    return this.refundsService.create(admin.tenantId, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  setStatus(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdateRefundStatusDto) {
    return this.refundsService.setStatus(admin.tenantId, id, dto);
  }
}
