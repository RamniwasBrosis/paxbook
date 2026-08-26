import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { AdminCancellationRequestsService } from "./admin-cancellation-requests.service";
import { ResolveCancellationRequestDto } from "./dto/resolve-cancellation-request.dto";

@ApiTags("bookings")
@ApiBearerAuth()
@Controller({ path: "admin/cancellation-requests", version: "1" })
export class AdminCancellationRequestsController {
  constructor(private readonly adminCancellationRequestsService: AdminCancellationRequestsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.BOOKINGS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.adminCancellationRequestsService.findAll(admin.tenantId);
  }

  @Patch(":id/resolve")
  @RequirePermissions(PERMISSIONS.BOOKINGS_WRITE)
  resolve(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: ResolveCancellationRequestDto) {
    return this.adminCancellationRequestsService.resolve(admin.tenantId, admin.sub, id, dto);
  }
}
