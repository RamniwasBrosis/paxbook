import { Injectable, NotFoundException } from "@nestjs/common";
import type { LeadFollowUpDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveLeadFollowUpDto } from "./dto/save-lead-follow-up.dto";

@Injectable()
export class LeadFollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, leadId: string, dto: SaveLeadFollowUpDto): Promise<LeadFollowUpDto> {
    await this.assertLeadOwned(tenantId, leadId);
    const created = await this.prisma.leadFollowUp.create({
      data: {
        leadId,
        scheduledAt: new Date(dto.scheduledAt),
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        notes: dto.notes,
        method: dto.method,
      },
    });
    return toDto(created);
  }

  async update(tenantId: string, leadId: string, id: string, dto: SaveLeadFollowUpDto): Promise<LeadFollowUpDto> {
    await this.assertOwned(tenantId, leadId, id);
    const updated = await this.prisma.leadFollowUp.update({
      where: { id },
      data: {
        scheduledAt: new Date(dto.scheduledAt),
        completedAt: dto.completedAt ? new Date(dto.completedAt) : dto.completedAt === "" ? null : undefined,
        notes: dto.notes,
        method: dto.method,
      },
    });
    return toDto(updated);
  }

  async remove(tenantId: string, leadId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, leadId, id);
    await this.prisma.leadFollowUp.delete({ where: { id } });
  }

  private async assertLeadOwned(tenantId: string, leadId: string): Promise<void> {
    const count = await this.prisma.lead.count({ where: { id: leadId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "LEAD_NOT_FOUND", message: "Lead does not exist." });
    }
  }

  private async assertOwned(tenantId: string, leadId: string, id: string): Promise<void> {
    await this.assertLeadOwned(tenantId, leadId);
    const count = await this.prisma.leadFollowUp.count({ where: { id, leadId } });
    if (count === 0) {
      throw new NotFoundException({ code: "FOLLOW_UP_NOT_FOUND", message: "Follow-up does not exist." });
    }
  }
}

function toDto(followUp: { id: string; scheduledAt: Date; completedAt: Date | null; notes: string | null; method: string | null }): LeadFollowUpDto {
  return {
    id: followUp.id,
    scheduledAt: followUp.scheduledAt.toISOString(),
    completedAt: followUp.completedAt?.toISOString() ?? null,
    notes: followUp.notes,
    method: followUp.method,
  };
}
