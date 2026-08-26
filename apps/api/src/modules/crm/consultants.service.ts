import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ConsultantDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveConsultantDto } from "./dto/save-consultant.dto";
import type { UpdateConsultantDto } from "./dto/update-consultant.dto";

const INCLUDE = { adminUser: { select: { name: true, email: true } } } satisfies Prisma.ConsultantInclude;
type Row = Prisma.ConsultantGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class ConsultantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<ConsultantDto[]> {
    const consultants = await this.prisma.consultant.findMany({
      where: { adminUser: { tenantId } },
      include: INCLUDE,
      orderBy: { adminUser: { name: "asc" } },
    });
    return consultants.map(toDto);
  }

  async create(tenantId: string, dto: SaveConsultantDto): Promise<ConsultantDto> {
    const admin = await this.prisma.adminUser.findFirst({ where: { id: dto.adminUserId, tenantId } });
    if (!admin) {
      throw new NotFoundException({ code: "ADMIN_NOT_FOUND", message: "Selected admin user does not exist." });
    }
    try {
      const created = await this.prisma.consultant.create({
        data: { adminUserId: dto.adminUserId, targetRevenue: dto.targetRevenue },
        include: INCLUDE,
      });
      return toDto(created);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException({ code: "ALREADY_CONSULTANT", message: "This admin user is already a consultant." });
      }
      throw err;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateConsultantDto): Promise<ConsultantDto> {
    await this.getOwned(tenantId, id);
    const updated = await this.prisma.consultant.update({ where: { id }, data: { targetRevenue: dto.targetRevenue }, include: INCLUDE });
    return toDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.consultant.delete({ where: { id } });
  }

  private async getOwned(tenantId: string, id: string): Promise<Row> {
    const consultant = await this.prisma.consultant.findFirst({ where: { id, adminUser: { tenantId } }, include: INCLUDE });
    if (!consultant) {
      throw new NotFoundException({ code: "CONSULTANT_NOT_FOUND", message: "Consultant does not exist." });
    }
    return consultant;
  }
}

function toDto(consultant: Row): ConsultantDto {
  return {
    id: consultant.id,
    adminUserId: consultant.adminUserId,
    adminUserName: consultant.adminUser.name,
    adminUserEmail: consultant.adminUser.email,
    targetRevenue: consultant.targetRevenue?.toNumber() ?? null,
    activeLeadCount: consultant.activeLeadCount,
  };
}
