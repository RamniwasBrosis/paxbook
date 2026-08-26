import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { PaymentsService } from "./payments.service";
import { SavePaymentDto } from "./dto/save-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";

@ApiTags("finance")
@ApiBearerAuth()
@Controller({ path: "payments", version: "1" })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.paymentsService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SavePaymentDto) {
    return this.paymentsService.create(admin.tenantId, dto);
  }

  @Patch(":id/status")
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  setStatus(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.paymentsService.setStatus(admin.tenantId, id, dto);
  }
}
