import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PaymentDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SavePaymentDto } from "./dto/save-payment.dto";
import type { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";

const INCLUDE = {
  booking: { select: { customer: { select: { name: true } }, package: { select: { title: true } }, totalAmount: true } },
} satisfies Prisma.PaymentInclude;
type Row = Prisma.PaymentGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<PaymentDto[]> {
    const payments = await this.prisma.payment.findMany({ where: { tenantId }, include: INCLUDE, orderBy: { createdAt: "desc" } });
    return payments.map(toDto);
  }

  async create(tenantId: string, dto: SavePaymentDto): Promise<PaymentDto> {
    await this.assertBookingBelongsToTenant(tenantId, dto.bookingId);
    const created = await this.prisma.payment.create({
      data: { tenantId, bookingId: dto.bookingId, provider: dto.provider ?? "razorpay", providerRef: dto.providerRef, amount: dto.amount, method: dto.method },
      include: INCLUDE,
    });
    return toDto(created);
  }

  async setStatus(tenantId: string, id: string, dto: UpdatePaymentStatusDto): Promise<PaymentDto> {
    const existing = await this.getOwned(tenantId, id);
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: dto.status, capturedAt: dto.status === "CAPTURED" ? new Date() : undefined },
      include: INCLUDE,
    });
    await this.recomputeBookingPaymentStatus(existing.bookingId);
    return toDto(updated);
  }

  /** Self-corrects Booking.paymentStatus from real Payment/Refund sums — called after any status change to either. */
  async recomputeBookingPaymentStatus(bookingId: string): Promise<void> {
    const [capturedAgg, refundedAgg, booking] = await Promise.all([
      this.prisma.payment.aggregate({ where: { bookingId, status: "CAPTURED" }, _sum: { amount: true } }),
      this.prisma.refundRequest.aggregate({ where: { bookingId, status: "PROCESSED" }, _sum: { amount: true } }),
      this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, select: { totalAmount: true } }),
    ]);

    const captured = capturedAgg._sum.amount?.toNumber() ?? 0;
    const refunded = refundedAgg._sum.amount?.toNumber() ?? 0;
    const netPaid = captured - refunded;
    const total = booking.totalAmount.toNumber();

    const paymentStatus = netPaid <= 0 && refunded > 0 ? "REFUNDED" : netPaid >= total && total > 0 ? "PAID" : netPaid > 0 ? "PARTIAL" : "PENDING";

    await this.prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus } });
  }

  private async getOwned(tenantId: string, id: string): Promise<Row> {
    const payment = await this.prisma.payment.findFirst({ where: { id, tenantId }, include: INCLUDE });
    if (!payment) {
      throw new NotFoundException({ code: "PAYMENT_NOT_FOUND", message: "Payment does not exist." });
    }
    return payment;
  }

  private async assertBookingBelongsToTenant(tenantId: string, bookingId: string): Promise<void> {
    const count = await this.prisma.booking.count({ where: { id: bookingId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Selected booking does not exist." });
    }
  }
}

function toDto(payment: Row): PaymentDto {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    bookingCustomerName: payment.booking.customer.name,
    bookingPackageTitle: payment.booking.package.title,
    provider: payment.provider,
    providerRef: payment.providerRef,
    amount: payment.amount.toNumber(),
    status: payment.status,
    method: payment.method,
    capturedAt: payment.capturedAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
  };
}
