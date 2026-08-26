import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CouponDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveCouponDto } from "./dto/save-coupon.dto";

const COUPON_INCLUDE = { destination: { select: { name: true } } } satisfies Prisma.CouponInclude;
type CouponRow = Prisma.CouponGetPayload<{ include: typeof COUPON_INCLUDE }>;

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<CouponDto[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { tenantId },
      include: COUPON_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return coupons.map(toCouponDto);
  }

  async create(tenantId: string, dto: SaveCouponDto): Promise<CouponDto> {
    try {
      const created = await this.prisma.coupon.create({
        data: {
          tenantId,
          code: dto.code.toUpperCase(),
          description: dto.description,
          discountType: dto.discountType,
          value: dto.value,
          minBookingAmount: dto.minBookingAmount,
          maxDiscountAmount: dto.maxDiscountAmount,
          destinationId: dto.destinationId,
          validFrom: new Date(dto.validFrom),
          validTo: new Date(dto.validTo),
          usageLimit: dto.usageLimit,
          isActive: dto.isActive ?? true,
        },
        include: COUPON_INCLUDE,
      });
      return toCouponDto(created);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async update(tenantId: string, id: string, dto: SaveCouponDto): Promise<CouponDto> {
    await this.assertOwned(tenantId, id);
    try {
      const updated = await this.prisma.coupon.update({
        where: { id },
        data: {
          code: dto.code.toUpperCase(),
          description: dto.description,
          discountType: dto.discountType,
          value: dto.value,
          minBookingAmount: dto.minBookingAmount,
          maxDiscountAmount: dto.maxDiscountAmount,
          destinationId: dto.destinationId ?? null,
          validFrom: new Date(dto.validFrom),
          validTo: new Date(dto.validTo),
          usageLimit: dto.usageLimit,
          isActive: dto.isActive,
        },
        include: COUPON_INCLUDE,
      });
      return toCouponDto(updated);
    } catch (err) {
      throw this.mapWriteError(err);
    }
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.assertOwned(tenantId, id);
    await this.prisma.coupon.delete({ where: { id } });
  }

  private async assertOwned(tenantId: string, id: string): Promise<void> {
    const coupon = await this.prisma.coupon.findFirst({ where: { id, tenantId } });
    if (!coupon) {
      throw new NotFoundException({ code: "COUPON_NOT_FOUND", message: "Coupon does not exist." });
    }
  }

  private mapWriteError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new ConflictException({ code: "COUPON_CODE_TAKEN", message: "A coupon with this code already exists." });
    }
    return err as Error;
  }
}

function toCouponDto(coupon: CouponRow): CouponDto {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value.toNumber(),
    minBookingAmount: coupon.minBookingAmount?.toNumber() ?? null,
    maxDiscountAmount: coupon.maxDiscountAmount?.toNumber() ?? null,
    destinationId: coupon.destinationId,
    destinationName: coupon.destination?.name ?? null,
    validFrom: coupon.validFrom.toISOString(),
    validTo: coupon.validTo.toISOString(),
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
  };
}
