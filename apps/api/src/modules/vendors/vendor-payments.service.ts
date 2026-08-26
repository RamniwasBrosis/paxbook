import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { VendorPaymentDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SaveVendorPaymentDto } from "./dto/save-vendor-payment.dto";

const INCLUDE = { vendor: { select: { name: true, tenantId: true } } } satisfies Prisma.VendorPaymentInclude;
type Row = Prisma.VendorPaymentGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class VendorPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, vendorId?: string): Promise<VendorPaymentDto[]> {
    const payments = await this.prisma.vendorPayment.findMany({
      where: { vendor: { tenantId }, vendorId },
      include: INCLUDE,
      orderBy: { id: "desc" },
    });
    return payments.map(toDto);
  }

  async create(tenantId: string, dto: SaveVendorPaymentDto): Promise<VendorPaymentDto> {
    await this.assertVendorBelongsToTenant(tenantId, dto.vendorId);
    if (dto.bookingId) await this.assertBookingBelongsToTenant(tenantId, dto.bookingId);

    const created = await this.prisma.vendorPayment.create({
      data: { vendorId: dto.vendorId, bookingId: dto.bookingId, amount: dto.amount },
      include: INCLUDE,
    });
    return toDto(created);
  }

  async markPaid(tenantId: string, id: string): Promise<VendorPaymentDto> {
    await this.getOwned(tenantId, id);
    const updated = await this.prisma.vendorPayment.update({ where: { id }, data: { status: "PAID", paidAt: new Date() }, include: INCLUDE });
    return toDto(updated);
  }

  private async getOwned(tenantId: string, id: string): Promise<Row> {
    const payment = await this.prisma.vendorPayment.findFirst({ where: { id, vendor: { tenantId } }, include: INCLUDE });
    if (!payment) {
      throw new NotFoundException({ code: "VENDOR_PAYMENT_NOT_FOUND", message: "Vendor payment does not exist." });
    }
    return payment;
  }

  private async assertVendorBelongsToTenant(tenantId: string, vendorId: string): Promise<void> {
    const count = await this.prisma.vendor.count({ where: { id: vendorId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "VENDOR_NOT_FOUND", message: "Selected vendor does not exist." });
    }
  }

  private async assertBookingBelongsToTenant(tenantId: string, bookingId: string): Promise<void> {
    const count = await this.prisma.booking.count({ where: { id: bookingId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Selected booking does not exist." });
    }
  }
}

function toDto(payment: Row): VendorPaymentDto {
  return {
    id: payment.id,
    vendorId: payment.vendorId,
    vendorName: payment.vendor.name,
    bookingId: payment.bookingId,
    amount: payment.amount.toNumber(),
    status: payment.status,
    paidAt: payment.paidAt?.toISOString() ?? null,
  };
}
