import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { InvoiceDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { SaveInvoiceDto } from "./dto/save-invoice.dto";

const INCLUDE = {
  booking: { select: { customer: { select: { name: true } }, package: { select: { title: true } } } },
} satisfies Prisma.InvoiceInclude;
type Row = Prisma.InvoiceGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<InvoiceDto[]> {
    const invoices = await this.prisma.invoice.findMany({ where: { tenantId }, include: INCLUDE, orderBy: { issuedAt: "desc" } });
    return invoices.map((i) => this.toDto(i));
  }

  async create(tenantId: string, dto: SaveInvoiceDto): Promise<InvoiceDto> {
    await this.assertBookingBelongsToTenant(tenantId, dto.bookingId);
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);
    const created = await this.prisma.invoice.create({
      data: { tenantId, bookingId: dto.bookingId, amount: dto.amount, storageKey: dto.storageKey, invoiceNumber },
      include: INCLUDE,
    });
    return this.toDto(created);
  }

  private async assertBookingBelongsToTenant(tenantId: string, bookingId: string): Promise<void> {
    const count = await this.prisma.booking.count({ where: { id: bookingId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Selected booking does not exist." });
    }
  }

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const countThisMonth = await this.prisma.invoice.count({
      where: { tenantId, invoiceNumber: { startsWith: `INV-${yearMonth}-` } },
    });
    return `INV-${yearMonth}-${String(countThisMonth + 1).padStart(4, "0")}`;
  }

  private toDto(invoice: Row): InvoiceDto {
    return {
      id: invoice.id,
      bookingId: invoice.bookingId,
      bookingCustomerName: invoice.booking.customer.name,
      bookingPackageTitle: invoice.booking.package.title,
      invoiceNumber: invoice.invoiceNumber,
      storageKey: invoice.storageKey,
      fileUrl: this.storageService.buildPublicUrl(invoice.storageKey),
      amount: invoice.amount.toNumber(),
      issuedAt: invoice.issuedAt.toISOString(),
    };
  }
}
