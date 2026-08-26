import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type { ProvisionPortalAccessResultDto, VendorCategoryType, VendorContractDto, VendorDetailDto, VendorDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { SaveVendorDto } from "./dto/save-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string, categoryType?: VendorCategoryType): Promise<VendorDto[]> {
    const vendors = await this.prisma.vendor.findMany({
      where: { tenantId, categoryType },
      orderBy: { name: "asc" },
    });
    return vendors.map(toDto);
  }

  async findOne(tenantId: string, id: string): Promise<VendorDetailDto> {
    const vendor = await this.prisma.vendor.findFirst({ where: { id, tenantId }, include: { contracts: true } });
    if (!vendor) {
      throw new NotFoundException({ code: "VENDOR_NOT_FOUND", message: "Vendor does not exist." });
    }
    return { ...toDto(vendor), contracts: vendor.contracts.map((c) => this.toContractDto(c)) };
  }

  async create(tenantId: string, dto: SaveVendorDto): Promise<VendorDto> {
    const created = await this.prisma.vendor.create({
      data: { tenantId, name: dto.name, categoryType: dto.categoryType, contactInfo: dto.contactInfo, status: dto.status ?? "ACTIVE" },
    });
    return toDto(created);
  }

  async update(tenantId: string, id: string, dto: SaveVendorDto): Promise<VendorDto> {
    await this.assertOwned(tenantId, id);
    const updated = await this.prisma.vendor.update({
      where: { id },
      data: { name: dto.name, categoryType: dto.categoryType, contactInfo: dto.contactInfo, status: dto.status },
    });
    return toDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    try {
      await this.prisma.vendor.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw new ConflictException({
          code: "VENDOR_HAS_RELATED_RECORDS",
          message: "This vendor is referenced by packages, contracts, or payments and can't be deleted.",
        });
      }
      throw err;
    }
  }

  async assertOwned(tenantId: string, id: string): Promise<void> {
    const count = await this.prisma.vendor.count({ where: { id, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "VENDOR_NOT_FOUND", message: "Vendor does not exist." });
    }
  }

  async provisionPortalAccess(tenantId: string, id: string, email: string): Promise<ProvisionPortalAccessResultDto> {
    await this.assertOwned(tenantId, id);
    const temporaryPassword = generateTemporaryPassword();
    try {
      await this.prisma.vendor.update({
        where: { id },
        data: { email, passwordHash: await argon2.hash(temporaryPassword) },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException({ code: "VENDOR_EMAIL_TAKEN", message: "Another vendor already uses this email." });
      }
      throw err;
    }
    return { email, temporaryPassword };
  }

  async resetPortalPassword(tenantId: string, id: string): Promise<{ temporaryPassword: string }> {
    const vendor = await this.prisma.vendor.findFirst({ where: { id, tenantId } });
    if (!vendor) {
      throw new NotFoundException({ code: "VENDOR_NOT_FOUND", message: "Vendor does not exist." });
    }
    if (!vendor.email) {
      throw new BadRequestException({ code: "PORTAL_ACCESS_NOT_ENABLED", message: "Enable portal access first by setting an email." });
    }
    const temporaryPassword = generateTemporaryPassword();
    await this.prisma.vendor.update({ where: { id }, data: { passwordHash: await argon2.hash(temporaryPassword) } });
    return { temporaryPassword };
  }

  toContractDto(contract: {
    id: string;
    startDate: Date;
    endDate: Date | null;
    terms: string | null;
    commissionRate: Prisma.Decimal | null;
    storageKey: string | null;
  }): VendorContractDto {
    return {
      id: contract.id,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate?.toISOString() ?? null,
      terms: contract.terms,
      commissionRate: contract.commissionRate?.toNumber() ?? null,
      storageKey: contract.storageKey,
      fileUrl: this.storageService.buildPublicUrl(contract.storageKey),
    };
  }
}

function toDto(vendor: {
  id: string;
  name: string;
  categoryType: VendorCategoryType;
  contactInfo: string | null;
  status: "ACTIVE" | "INACTIVE";
  email: string | null;
}): VendorDto {
  return { id: vendor.id, name: vendor.name, categoryType: vendor.categoryType, contactInfo: vendor.contactInfo, status: vendor.status, email: vendor.email };
}

function generateTemporaryPassword(): string {
  return randomBytes(9).toString("base64url");
}
