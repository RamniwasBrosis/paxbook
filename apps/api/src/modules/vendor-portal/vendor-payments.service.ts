import { Injectable } from "@nestjs/common";
import type { VendorPaymentDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class VendorPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, vendorId: string): Promise<VendorPaymentDto[]> {
    const payments = await this.prisma.vendorPayment.findMany({
      where: { vendorId, vendor: { tenantId } },
      include: { vendor: { select: { name: true } } },
      orderBy: { id: "desc" },
    });
    return payments.map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      vendorName: p.vendor.name,
      bookingId: p.bookingId,
      amount: p.amount.toNumber(),
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
    }));
  }
}
