import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { RefundDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PaymentsService } from "./payments.service";
import type { SaveRefundDto } from "./dto/save-refund.dto";
import type { UpdateRefundStatusDto } from "./dto/update-refund-status.dto";

const INCLUDE = {
  booking: { select: { customer: { select: { name: true } }, package: { select: { title: true } } } },
} satisfies Prisma.RefundRequestInclude;
type Row = Prisma.RefundRequestGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async findAll(tenantId: string): Promise<RefundDto[]> {
    const refunds = await this.prisma.refundRequest.findMany({ where: { booking: { tenantId } }, include: INCLUDE, orderBy: { id: "desc" } });
    return refunds.map(toDto);
  }

  async create(tenantId: string, dto: SaveRefundDto): Promise<RefundDto> {
    await this.assertBookingBelongsToTenant(tenantId, dto.bookingId);
    const payment = await this.prisma.payment.findFirst({ where: { id: dto.paymentId, bookingId: dto.bookingId } });
    if (!payment) {
      throw new BadRequestException({ code: "PAYMENT_NOT_ON_BOOKING", message: "Selected payment does not belong to this booking." });
    }

    const created = await this.prisma.refundRequest.create({
      data: { bookingId: dto.bookingId, paymentId: dto.paymentId, amount: dto.amount, reason: dto.reason },
      include: INCLUDE,
    });
    return toDto(created);
  }

  async setStatus(tenantId: string, id: string, dto: UpdateRefundStatusDto): Promise<RefundDto> {
    const existing = await this.getOwned(tenantId, id);
    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: { status: dto.status, processedAt: dto.status === "PROCESSED" ? new Date() : undefined },
      include: INCLUDE,
    });
    if (dto.status === "PROCESSED") {
      await this.paymentsService.recomputeBookingPaymentStatus(existing.bookingId);
    }
    return toDto(updated);
  }

  private async getOwned(tenantId: string, id: string): Promise<Row> {
    const refund = await this.prisma.refundRequest.findFirst({ where: { id, booking: { tenantId } }, include: INCLUDE });
    if (!refund) {
      throw new NotFoundException({ code: "REFUND_NOT_FOUND", message: "Refund request does not exist." });
    }
    return refund;
  }

  private async assertBookingBelongsToTenant(tenantId: string, bookingId: string): Promise<void> {
    const count = await this.prisma.booking.count({ where: { id: bookingId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Selected booking does not exist." });
    }
  }
}

function toDto(refund: Row): RefundDto {
  return {
    id: refund.id,
    bookingId: refund.bookingId,
    bookingCustomerName: refund.booking.customer.name,
    bookingPackageTitle: refund.booking.package.title,
    paymentId: refund.paymentId,
    amount: refund.amount.toNumber(),
    reason: refund.reason,
    status: refund.status,
    processedAt: refund.processedAt?.toISOString() ?? null,
  };
}
