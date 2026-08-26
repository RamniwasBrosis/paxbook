import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  BookingDetailDto,
  BookingInvoiceViewDto,
  BookingSummaryDto,
  BookingVoucherViewDto,
  CancellationRequestDto,
  CancellationRequestStatus,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { BookingsService } from "../bookings/bookings.service";
import type { CreateBookingRequestDto } from "./dto/create-booking-request.dto";
import type { CreateCancellationRequestDto } from "./dto/create-cancellation-request.dto";

@Injectable()
export class CustomerBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly bookingsService: BookingsService,
  ) {}

  findAll(tenantId: string, customerId: string): Promise<BookingSummaryDto[]> {
    return this.bookingsService.findAllForCustomer(tenantId, customerId);
  }

  findOne(tenantId: string, customerId: string, id: string): Promise<BookingDetailDto> {
    return this.bookingsService.findOneForCustomer(tenantId, customerId, id);
  }

  async createBookingRequest(tenantId: string, customerId: string, dto: CreateBookingRequestDto): Promise<BookingDetailDto> {
    const pkg = await this.prisma.package.findFirst({ where: { id: dto.packageId, tenantId, deletedAt: null, status: "PUBLISHED" } });
    if (!pkg) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Package does not exist." });
    }
    const travelerCount = dto.travelerCount ?? 1;
    const totalAmount = pkg.basePrice.toNumber() * travelerCount;

    return this.bookingsService.create(tenantId, null, {
      customerId,
      packageId: dto.packageId,
      totalAmount,
      travelStartDate: dto.travelStartDate,
      travelEndDate: dto.travelEndDate,
    });
  }

  async requestCancellation(tenantId: string, customerId: string, bookingId: string, dto: CreateCancellationRequestDto): Promise<CancellationRequestDto> {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, tenantId, customerId } });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    const existing = await this.prisma.cancellationRequest.findFirst({ where: { bookingId, status: "REQUESTED" } });
    if (existing) {
      throw new BadRequestException({ code: "CANCELLATION_ALREADY_REQUESTED", message: "A cancellation request is already pending for this booking." });
    }
    const created = await this.prisma.cancellationRequest.create({
      data: { bookingId, customerId, reason: dto.reason },
      include: { customer: { select: { name: true } } },
    });
    return toCancellationRequestDto(created);
  }

  async listMyCancellationRequests(tenantId: string, customerId: string): Promise<CancellationRequestDto[]> {
    const requests = await this.prisma.cancellationRequest.findMany({
      where: { customerId, booking: { tenantId } },
      include: { customer: { select: { name: true } } },
      orderBy: { requestedAt: "desc" },
    });
    return requests.map(toCancellationRequestDto);
  }

  async getInvoice(tenantId: string, customerId: string, bookingId: string): Promise<BookingInvoiceViewDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, customerId },
      include: { customer: true, package: true, invoices: { orderBy: { issuedAt: "desc" }, take: 1 } },
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    const invoice = booking.invoices[0];
    if (!invoice) {
      throw new NotFoundException({ code: "INVOICE_NOT_FOUND", message: "No invoice has been issued for this booking yet." });
    }
    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingId: booking.id,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      packageTitle: booking.package.title,
      amount: invoice.amount.toNumber(),
      currency: booking.currency,
      issuedAt: invoice.issuedAt.toISOString(),
      fileUrl: this.storageService.buildPublicUrl(invoice.storageKey),
    };
  }

  async getVoucher(tenantId: string, customerId: string, bookingId: string): Promise<BookingVoucherViewDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, customerId },
      include: { customer: true, package: true, voucher: true, travelers: { include: { traveler: true } } },
    });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      throw new NotFoundException({ code: "VOUCHER_NOT_AVAILABLE", message: "Your travel voucher will be available once the booking is confirmed." });
    }
    return {
      bookingId: booking.id,
      customerName: booking.customer.name,
      packageTitle: booking.package.title,
      travelStartDate: booking.travelStartDate?.toISOString() ?? null,
      travelEndDate: booking.travelEndDate?.toISOString() ?? null,
      travelers: booking.travelers.map((t) => ({ name: t.traveler.name, passportNumber: t.traveler.passportNumber })),
      generatedAt: booking.voucher?.generatedAt.toISOString() ?? new Date().toISOString(),
      fileUrl: booking.voucher ? this.storageService.buildPublicUrl(booking.voucher.storageKey) : null,
    };
  }
}

export function toCancellationRequestDto(r: {
  id: string;
  bookingId: string;
  customerId: string;
  customer: { name: string };
  reason: string | null;
  status: CancellationRequestStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
  resolutionNote: string | null;
}): CancellationRequestDto {
  return {
    id: r.id,
    bookingId: r.bookingId,
    customerId: r.customerId,
    customerName: r.customer.name,
    reason: r.reason,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolutionNote: r.resolutionNote,
  };
}
