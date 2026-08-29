import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { LeadDetailDto, LeadSummaryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveLeadDto } from "./dto/save-lead.dto";
import type { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";

const ACTIVE_STATUSES = ["NEW", "CONTACTED", "QUALIFIED"] as const;

const SUMMARY_INCLUDE = {
  assignedConsultant: { select: { name: true } },
  package: { select: { title: true } },
} satisfies Prisma.LeadInclude;
type SummaryRow = Prisma.LeadGetPayload<{ include: typeof SUMMARY_INCLUDE }>;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<LeadSummaryDto[]> {
    const leads = await this.prisma.lead.findMany({ where: { tenantId }, include: SUMMARY_INCLUDE, orderBy: { createdAt: "desc" } });
    return leads.map(toSummaryDto);
  }

  async findOne(tenantId: string, id: string): Promise<LeadDetailDto> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: { ...SUMMARY_INCLUDE, followUps: { orderBy: { scheduledAt: "asc" } } },
    });
    if (!lead) {
      throw new NotFoundException({ code: "LEAD_NOT_FOUND", message: "Lead does not exist." });
    }
    return {
      ...toSummaryDto(lead),
      followUps: lead.followUps.map((f) => ({
        id: f.id,
        scheduledAt: f.scheduledAt.toISOString(),
        completedAt: f.completedAt?.toISOString() ?? null,
        notes: f.notes,
        method: f.method,
      })),
    };
  }

  async create(tenantId: string, dto: SaveLeadDto): Promise<LeadSummaryDto> {
    if (dto.customerId) await this.assertCustomerBelongsToTenant(tenantId, dto.customerId);

    const created = await this.prisma.lead.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        destinationInterest: dto.destinationInterest,
        customerId: dto.customerId,
        assignedConsultantId: dto.assignedConsultantId || undefined,
        travellerType: dto.travellerType,
        interests: dto.interests ?? [],
        tripDuration: dto.tripDuration,
        departureCity: dto.departureCity,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : undefined,
        packageId: dto.packageId,
      },
      include: SUMMARY_INCLUDE,
    });

    if (created.assignedConsultantId) await this.recomputeConsultantCount(created.assignedConsultantId);
    return toSummaryDto(created);
  }

  async update(tenantId: string, id: string, dto: SaveLeadDto): Promise<LeadSummaryDto> {
    const existing = await this.getOwned(tenantId, id);
    if (dto.customerId) await this.assertCustomerBelongsToTenant(tenantId, dto.customerId);

    const newConsultantId = dto.assignedConsultantId === "" ? null : (dto.assignedConsultantId ?? existing.assignedConsultantId);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        destinationInterest: dto.destinationInterest,
        customerId: dto.customerId,
        assignedConsultantId: newConsultantId,
        travellerType: dto.travellerType,
        interests: dto.interests ?? existing.interests,
        tripDuration: dto.tripDuration,
        departureCity: dto.departureCity,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : undefined,
        packageId: dto.packageId,
      },
      include: SUMMARY_INCLUDE,
    });

    const touched = new Set([existing.assignedConsultantId, newConsultantId].filter((x): x is string => Boolean(x)));
    for (const consultantAdminId of touched) await this.recomputeConsultantCount(consultantAdminId);

    return toSummaryDto(updated);
  }

  async setStatus(tenantId: string, id: string, dto: UpdateLeadStatusDto): Promise<LeadSummaryDto> {
    const existing = await this.getOwned(tenantId, id);
    const updated = await this.prisma.lead.update({ where: { id }, data: { status: dto.status }, include: SUMMARY_INCLUDE });
    if (existing.assignedConsultantId) await this.recomputeConsultantCount(existing.assignedConsultantId);
    return toSummaryDto(updated);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const existing = await this.getOwned(tenantId, id);
    await this.prisma.lead.delete({ where: { id } });
    if (existing.assignedConsultantId) await this.recomputeConsultantCount(existing.assignedConsultantId);
  }

  private async getOwned(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) {
      throw new NotFoundException({ code: "LEAD_NOT_FOUND", message: "Lead does not exist." });
    }
    return lead;
  }

  private async assertCustomerBelongsToTenant(tenantId: string, customerId: string): Promise<void> {
    const count = await this.prisma.customer.count({ where: { id: customerId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "CUSTOMER_NOT_FOUND", message: "Selected customer does not exist." });
    }
  }

  /** Recomputed (not incrementally patched) so it always self-corrects, even after concurrent writes. */
  private async recomputeConsultantCount(adminUserId: string): Promise<void> {
    const consultant = await this.prisma.consultant.findUnique({ where: { adminUserId } });
    if (!consultant) return;
    const activeLeadCount = await this.prisma.lead.count({
      where: { assignedConsultantId: adminUserId, status: { in: [...ACTIVE_STATUSES] } },
    });
    await this.prisma.consultant.update({ where: { id: consultant.id }, data: { activeLeadCount } });
  }
}

function toSummaryDto(lead: SummaryRow): LeadSummaryDto {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    destinationInterest: lead.destinationInterest,
    customerId: lead.customerId,
    assignedConsultantId: lead.assignedConsultantId,
    assignedConsultantName: lead.assignedConsultant?.name ?? null,
    travellerType: lead.travellerType,
    interests: lead.interests,
    tripDuration: lead.tripDuration,
    departureCity: lead.departureCity,
    departureDate: lead.departureDate?.toISOString() ?? null,
    packageId: lead.packageId,
    packageTitle: lead.package?.title ?? null,
    createdAt: lead.createdAt.toISOString(),
  };
}
