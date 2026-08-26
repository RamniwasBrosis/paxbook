import { Injectable, NotFoundException } from "@nestjs/common";
import type { VendorContractDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { UpdateVendorContractDocumentDto } from "./dto/update-vendor-contract-document.dto";

@Injectable()
export class VendorContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string, vendorId: string): Promise<VendorContractDto[]> {
    const contracts = await this.prisma.vendorContract.findMany({
      where: { vendorId, vendor: { tenantId } },
      orderBy: { startDate: "desc" },
    });
    return contracts.map((c) => this.toDto(c));
  }

  async updateDocument(tenantId: string, vendorId: string, contractId: string, dto: UpdateVendorContractDocumentDto): Promise<VendorContractDto> {
    const contract = await this.prisma.vendorContract.findFirst({ where: { id: contractId, vendorId, vendor: { tenantId } } });
    if (!contract) {
      throw new NotFoundException({ code: "VENDOR_CONTRACT_NOT_FOUND", message: "Contract does not exist." });
    }
    const updated = await this.prisma.vendorContract.update({ where: { id: contractId }, data: { storageKey: dto.storageKey } });
    return this.toDto(updated);
  }

  private toDto(contract: { id: string; startDate: Date; endDate: Date | null; terms: string | null; commissionRate: { toNumber(): number } | null; storageKey: string | null }): VendorContractDto {
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
