import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { EmiInstallmentDto, EmiPlanDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveEmiPlanDto } from "./dto/save-emi-plan.dto";

@Injectable()
export class EmiPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(tenantId: string, bookingId: string): Promise<EmiPlanDto | null> {
    await this.assertBookingBelongsToTenant(tenantId, bookingId);
    const plan = await this.prisma.emiPlan.findUnique({ where: { bookingId } });
    return plan ? toDto(plan) : null;
  }

  async upsert(tenantId: string, bookingId: string, dto: SaveEmiPlanDto): Promise<EmiPlanDto> {
    await this.assertBookingBelongsToTenant(tenantId, bookingId);
    const plan = await this.prisma.emiPlan.upsert({
      where: { bookingId },
      update: { totalInstallments: dto.totalInstallments, schedule: dto.schedule as unknown as Prisma.InputJsonValue },
      create: { bookingId, totalInstallments: dto.totalInstallments, schedule: dto.schedule as unknown as Prisma.InputJsonValue },
    });
    return toDto(plan);
  }

  async remove(tenantId: string, bookingId: string): Promise<void> {
    await this.assertBookingBelongsToTenant(tenantId, bookingId);
    const plan = await this.prisma.emiPlan.findUnique({ where: { bookingId } });
    if (!plan) {
      throw new NotFoundException({ code: "EMI_PLAN_NOT_FOUND", message: "No EMI plan exists for this booking." });
    }
    await this.prisma.emiPlan.delete({ where: { bookingId } });
  }

  private async assertBookingBelongsToTenant(tenantId: string, bookingId: string): Promise<void> {
    const count = await this.prisma.booking.count({ where: { id: bookingId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
  }
}

function toDto(plan: { id: string; bookingId: string; totalInstallments: number; schedule: Prisma.JsonValue }): EmiPlanDto {
  return {
    id: plan.id,
    bookingId: plan.bookingId,
    totalInstallments: plan.totalInstallments,
    schedule: (plan.schedule as unknown as EmiInstallmentDto[]) ?? [],
  };
}
