import { Injectable } from "@nestjs/common";
import type { VisaInfoDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveVisaInfoDto } from "./dto/save-visa-info.dto";

/// Not tenant-scoped — visa rules are a fact about the country, shared across tenants.
@Injectable()
export class VisaInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<VisaInfoDto[]> {
    const countries = await this.prisma.country.findMany({
      include: { visaInfo: true },
      orderBy: { name: "asc" },
    });

    return countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      visaType: country.visaInfo?.visaType ?? null,
      requiredDocuments: country.visaInfo?.requiredDocuments ?? [],
      isVisaFree: country.visaInfo?.isVisaFree ?? false,
      processingTime: country.visaInfo?.processingTime ?? null,
      visaFee: country.visaInfo?.visaFee?.toNumber() ?? null,
      currency: country.visaInfo?.currency ?? null,
      notes: country.visaInfo?.notes ?? null,
      updatedAt: country.visaInfo?.updatedAt.toISOString() ?? null,
    }));
  }

  async upsert(countryId: string, dto: SaveVisaInfoDto): Promise<VisaInfoDto> {
    const country = await this.prisma.country.findUniqueOrThrow({ where: { id: countryId } });
    const visaInfo = await this.prisma.visaInfo.upsert({
      where: { countryId },
      update: {
        visaType: dto.visaType,
        requiredDocuments: dto.requiredDocuments,
        isVisaFree: dto.isVisaFree ?? false,
        processingTime: dto.processingTime,
        visaFee: dto.visaFee,
        currency: dto.currency ?? "INR",
        notes: dto.notes,
      },
      create: {
        countryId,
        visaType: dto.visaType,
        requiredDocuments: dto.requiredDocuments,
        isVisaFree: dto.isVisaFree ?? false,
        processingTime: dto.processingTime,
        visaFee: dto.visaFee,
        currency: dto.currency ?? "INR",
        notes: dto.notes,
      },
    });

    return {
      countryId: country.id,
      countryName: country.name,
      visaType: visaInfo.visaType,
      requiredDocuments: visaInfo.requiredDocuments,
      isVisaFree: visaInfo.isVisaFree,
      processingTime: visaInfo.processingTime,
      visaFee: visaInfo.visaFee?.toNumber() ?? null,
      currency: visaInfo.currency,
      notes: visaInfo.notes,
      updatedAt: visaInfo.updatedAt.toISOString(),
    };
  }
}
