import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PlanDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SavePlanDto } from "./dto/save-plan.dto";

@Injectable()
export class PlatformPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({ orderBy: { priceMonthly: "asc" } });
    return plans.map(toDto);
  }

  async findActive(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: "asc" } });
    return plans.map(toDto);
  }

  async create(dto: SavePlanDto): Promise<PlanDto> {
    try {
      const created = await this.prisma.plan.create({
        data: {
          name: dto.name,
          priceMonthly: dto.priceMonthly,
          currency: dto.currency ?? "INR",
          maxAdminUsers: dto.maxAdminUsers,
          maxPackages: dto.maxPackages,
          isActive: dto.isActive ?? true,
          razorpayPlanId: dto.razorpayPlanId,
        },
      });
      return toDto(created);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async update(id: string, dto: SavePlanDto): Promise<PlanDto> {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "PLAN_NOT_FOUND", message: "Plan does not exist." });
    }
    try {
      const updated = await this.prisma.plan.update({
        where: { id },
        data: {
          name: dto.name,
          priceMonthly: dto.priceMonthly,
          currency: dto.currency,
          maxAdminUsers: dto.maxAdminUsers,
          maxPackages: dto.maxPackages,
          isActive: dto.isActive,
          razorpayPlanId: dto.razorpayPlanId,
        },
      });
      return toDto(updated);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code: "PLAN_NAME_TAKEN", message: "A plan with this name already exists." });
    }
    return err as Error;
  }
}

function toDto(p: {
  id: string;
  name: string;
  priceMonthly: Prisma.Decimal;
  currency: string;
  maxAdminUsers: number | null;
  maxPackages: number | null;
  isActive: boolean;
  razorpayPlanId: string | null;
}): PlanDto {
  return {
    id: p.id,
    name: p.name,
    priceMonthly: p.priceMonthly.toNumber(),
    currency: p.currency,
    maxAdminUsers: p.maxAdminUsers,
    maxPackages: p.maxPackages,
    isActive: p.isActive,
    razorpayPlanId: p.razorpayPlanId,
  };
}
