import { Injectable, NotFoundException } from "@nestjs/common";
import type { VendorContractDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { VendorsService } from "./vendors.service";
import type { SaveVendorContractDto } from "./dto/save-vendor-contract.dto";

@Injectable()
export class VendorContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vendorsService: VendorsService,
  ) {}

  async create(tenantId: string, vendorId: string, dto: SaveVendorContractDto): Promise<VendorContractDto> {
    await this.vendorsService.assertOwned(tenantId, vendorId);
    const created = await this.prisma.vendorContract.create({
      data: {
        vendorId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        terms: dto.terms,
        commissionRate: dto.commissionRate,
        storageKey: dto.storageKey,
      },
    });
    return this.vendorsService.toContractDto(created);
  }

  async update(tenantId: string, vendorId: string, id: string, dto: SaveVendorContractDto): Promise<VendorContractDto> {
    await this.assertOwned(tenantId, vendorId, id);
    const updated = await this.prisma.vendorContract.update({
      where: { id },
      data: {
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        terms: dto.terms,
        commissionRate: dto.commissionRate,
        storageKey: dto.storageKey,
      },
    });
    return this.vendorsService.toContractDto(updated);
  }

  async remove(tenantId: string, vendorId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, vendorId, id);
    await this.prisma.vendorContract.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, vendorId: string, id: string): Promise<void> {
    await this.vendorsService.assertOwned(tenantId, vendorId);
    const count = await this.prisma.vendorContract.count({ where: { id, vendorId } });
    if (count === 0) {
      throw new NotFoundException({ code: "VENDOR_CONTRACT_NOT_FOUND", message: "Contract does not exist." });
    }
  }
}
