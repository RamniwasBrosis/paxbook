import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { VendorCategoryType, VendorProfileDto, VendorStatus } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { hashPassword, verifyPassword } from "../../common/crypto/password";
import type { UpdateVendorProfileDto } from "./dto/update-vendor-profile.dto";
import type { ChangeVendorPasswordDto } from "./dto/change-vendor-password.dto";

@Injectable()
export class VendorProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string, vendorId: string): Promise<VendorProfileDto> {
    const vendor = await this.getOwned(tenantId, vendorId);
    return toProfileDto(vendor);
  }

  async updateProfile(tenantId: string, vendorId: string, dto: UpdateVendorProfileDto): Promise<VendorProfileDto> {
    await this.getOwned(tenantId, vendorId);
    const updated = await this.prisma.vendor.update({ where: { id: vendorId }, data: { contactInfo: dto.contactInfo } });
    return toProfileDto(updated);
  }

  async changePassword(tenantId: string, vendorId: string, dto: ChangeVendorPasswordDto): Promise<void> {
    const vendor = await this.getOwned(tenantId, vendorId);
    if (!vendor.passwordHash) {
      throw new UnauthorizedException({ code: "PORTAL_ACCESS_NOT_ENABLED", message: "Portal access is not enabled for this vendor." });
    }
    const matches = await verifyPassword(vendor.passwordHash, dto.currentPassword);
    if (!matches) {
      throw new UnauthorizedException({ code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." });
    }
    await this.prisma.vendor.update({ where: { id: vendorId }, data: { passwordHash: await hashPassword(dto.newPassword) } });
  }

  private async getOwned(tenantId: string, vendorId: string) {
    const vendor = await this.prisma.vendor.findFirst({ where: { id: vendorId, tenantId } });
    if (!vendor) {
      throw new NotFoundException({ code: "VENDOR_NOT_FOUND", message: "Vendor does not exist." });
    }
    return vendor;
  }
}

function toProfileDto(v: {
  id: string;
  name: string;
  email: string | null;
  categoryType: VendorCategoryType;
  contactInfo: string | null;
  status: VendorStatus;
}): VendorProfileDto {
  return { id: v.id, name: v.name, email: v.email, categoryType: v.categoryType, contactInfo: v.contactInfo, status: v.status };
}
