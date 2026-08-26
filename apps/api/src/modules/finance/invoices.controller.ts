import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { InvoicesService } from "./invoices.service";
import { SaveInvoiceDto } from "./dto/save-invoice.dto";

@ApiTags("finance")
@ApiBearerAuth()
@Controller({ path: "invoices", version: "1" })
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.invoicesService.findAll(admin.tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveInvoiceDto) {
    return this.invoicesService.create(admin.tenantId, dto);
  }
}
