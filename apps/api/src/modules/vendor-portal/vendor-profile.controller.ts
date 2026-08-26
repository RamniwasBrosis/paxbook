import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";
import { VendorJwtAuthGuard } from "../vendor-auth/guards/vendor-jwt-auth.guard";
import { VendorProfileService } from "./vendor-profile.service";
import { UpdateVendorProfileDto } from "./dto/update-vendor-profile.dto";
import { ChangeVendorPasswordDto } from "./dto/change-vendor-password.dto";

@ApiTags("vendor-portal")
@Public()
@UseGuards(VendorJwtAuthGuard)
@SkipAudit()
@Controller({ path: "vendor/profile", version: "1" })
export class VendorProfileController {
  constructor(private readonly vendorProfileService: VendorProfileService) {}

  @Get()
  getProfile(@CurrentVendor() vendor: RequestVendor) {
    return this.vendorProfileService.getProfile(vendor.tenantId, vendor.sub);
  }

  @Patch()
  updateProfile(@CurrentVendor() vendor: RequestVendor, @Body() dto: UpdateVendorProfileDto) {
    return this.vendorProfileService.updateProfile(vendor.tenantId, vendor.sub, dto);
  }

  @Patch("password")
  async changePassword(@CurrentVendor() vendor: RequestVendor, @Body() dto: ChangeVendorPasswordDto) {
    await this.vendorProfileService.changePassword(vendor.tenantId, vendor.sub, dto);
    return { changed: true };
  }
}
