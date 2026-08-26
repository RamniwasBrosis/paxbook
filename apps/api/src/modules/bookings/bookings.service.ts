import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { BookingDetailDto, BookingSummaryDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import type { SaveBookingDto } from "./dto/save-booking.dto";
import type { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import type { SyncBookingTravelersDto } from "./dto/sync-booking-travelers.dto";
import type { SaveBookingVoucherDto } from "./dto/save-booking-voucher.dto";

const SUMMARY_INCLUDE = {
  customer: { select: { name: true } },
  package: { select: { title: true } },
  consultant: { select: { name: true } },
} satisfies Prisma.BookingInclude;

const DETAIL_INCLUDE = {
  ...SUMMARY_INCLUDE,
  travelers: { include: { traveler: true } },
  statusHistory: { include: { changedByAdmin: { select: { name: true } } }, orderBy: { changedAt: "asc" } },
  voucher: true,
} satisfies Prisma.BookingInclude;

type SummaryRow = Prisma.BookingGetPayload<{ include: typeof SUMMARY_INCLUDE }>;
type DetailRow = Prisma.BookingGetPayload<{ include: typeof DETAIL_INCLUDE }>;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(tenantId: string): Promise<BookingSummaryDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { tenantId },
      include: SUMMARY_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toSummaryDto);
  }

  async findOne(tenantId: string, id: string): Promise<BookingDetailDto> {
    const booking = await this.getOwnedDetail(tenantId, id);
    return this.toDetailDto(booking);
  }

  /** Customer-portal reads — scoped to the authenticated customer as well as the tenant. */
  async findAllForCustomer(tenantId: string, customerId: string): Promise<BookingSummaryDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { tenantId, customerId },
      include: SUMMARY_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return bookings.map(toSummaryDto);
  }

  async findOneForCustomer(tenantId: string, customerId: string, id: string): Promise<BookingDetailDto> {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId, customerId }, include: DETAIL_INCLUDE });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    return this.toDetailDto(booking);
  }

  /** adminId is null when the actor is a customer (customer-portal booking requests share this path rather than duplicating it). */
  async create(tenantId: string, adminId: string | null, dto: SaveBookingDto): Promise<BookingDetailDto> {
    await this.assertCustomerBelongsToTenant(tenantId, dto.customerId);
    await this.assertPackageBelongsToTenant(tenantId, dto.packageId);

    const created = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          tenantId,
          customerId: dto.customerId,
          packageId: dto.packageId,
          totalAmount: dto.totalAmount,
          currency: dto.currency ?? "INR",
          paymentStatus: dto.paymentStatus ?? "PENDING",
          travelStartDate: dto.travelStartDate ? new Date(dto.travelStartDate) : undefined,
          travelEndDate: dto.travelEndDate ? new Date(dto.travelEndDate) : undefined,
          consultantId: dto.consultantId || undefined,
        },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId: booking.id, fromStatus: null, toStatus: "DRAFT", changedByAdminId: adminId, note: "Booking created" },
      });
      return booking;
    });

    return this.findOne(tenantId, created.id);
  }

  async update(tenantId: string, id: string, dto: SaveBookingDto): Promise<BookingDetailDto> {
    const existing = await this.getOwnedDetail(tenantId, id);
    await this.assertPackageBelongsToTenant(tenantId, dto.packageId);

    const consultantId = dto.consultantId === "" ? null : (dto.consultantId ?? existing.consultantId);

    // customerId is intentionally not updatable here — changing it would orphan
    // the booking's linked travelers (they're scoped to the original customer).
    await this.prisma.booking.update({
      where: { id },
      data: {
        packageId: dto.packageId,
        totalAmount: dto.totalAmount,
        currency: dto.currency,
        paymentStatus: dto.paymentStatus,
        travelStartDate: dto.travelStartDate ? new Date(dto.travelStartDate) : undefined,
        travelEndDate: dto.travelEndDate ? new Date(dto.travelEndDate) : undefined,
        consultantId,
      },
    });

    return this.findOne(tenantId, id);
  }

  async setStatus(tenantId: string, id: string, adminId: string | null, dto: UpdateBookingStatusDto): Promise<BookingDetailDto> {
    const booking = await this.getOwnedDetail(tenantId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.bookingStatusHistory.create({
        data: { bookingId: id, fromStatus: booking.status, toStatus: dto.toStatus, changedByAdminId: adminId, note: dto.note },
      });
      await tx.booking.update({ where: { id }, data: { status: dto.toStatus } });
    });

    return this.findOne(tenantId, id);
  }

  async syncTravelers(tenantId: string, id: string, dto: SyncBookingTravelersDto): Promise<BookingDetailDto> {
    const booking = await this.getOwnedDetail(tenantId, id);

    if (dto.travelerIds.length > 0) {
      const ownedCount = await this.prisma.traveler.count({
        where: { id: { in: dto.travelerIds }, customerId: booking.customerId },
      });
      if (ownedCount !== dto.travelerIds.length) {
        throw new BadRequestException({
          code: "TRAVELER_NOT_OWNED_BY_CUSTOMER",
          message: "One or more travelers don't belong to this booking's customer.",
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.bookingTraveler.deleteMany({ where: { bookingId: id } });
      if (dto.travelerIds.length > 0) {
        await tx.bookingTraveler.createMany({ data: dto.travelerIds.map((travelerId) => ({ bookingId: id, travelerId })) });
      }
    });

    return this.findOne(tenantId, id);
  }

  async upsertVoucher(tenantId: string, id: string, dto: SaveBookingVoucherDto): Promise<BookingDetailDto> {
    await this.getOwnedDetail(tenantId, id);
    await this.prisma.voucher.upsert({
      where: { bookingId: id },
      update: { storageKey: dto.storageKey },
      create: { bookingId: id, storageKey: dto.storageKey },
    });
    return this.findOne(tenantId, id);
  }

  private async getOwnedDetail(tenantId: string, id: string): Promise<DetailRow> {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId }, include: DETAIL_INCLUDE });
    if (!booking) {
      throw new NotFoundException({ code: "BOOKING_NOT_FOUND", message: "Booking does not exist." });
    }
    return booking;
  }

  private async assertCustomerBelongsToTenant(tenantId: string, customerId: string): Promise<void> {
    const count = await this.prisma.customer.count({ where: { id: customerId, tenantId } });
    if (count === 0) {
      throw new NotFoundException({ code: "CUSTOMER_NOT_FOUND", message: "Selected customer does not exist." });
    }
  }

  private async assertPackageBelongsToTenant(tenantId: string, packageId: string): Promise<void> {
    const count = await this.prisma.package.count({ where: { id: packageId, tenantId, deletedAt: null } });
    if (count === 0) {
      throw new NotFoundException({ code: "PACKAGE_NOT_FOUND", message: "Selected package does not exist." });
    }
  }

  private toDetailDto(booking: DetailRow): BookingDetailDto {
    return {
      ...toSummaryDto(booking),
      travelers: booking.travelers.map((link) => ({
        id: link.traveler.id,
        name: link.traveler.name,
        dob: link.traveler.dob?.toISOString() ?? null,
        passportNumber: link.traveler.passportNumber,
        nationality: link.traveler.nationality,
      })),
      statusHistory: booking.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedByName: entry.changedByAdmin?.name ?? null,
        changedAt: entry.changedAt.toISOString(),
        note: entry.note,
      })),
      voucher: booking.voucher
        ? {
            storageKey: booking.voucher.storageKey,
            fileUrl: this.storageService.buildPublicUrl(booking.voucher.storageKey) ?? "",
            generatedAt: booking.voucher.generatedAt.toISOString(),
          }
        : null,
    };
  }
}

function toSummaryDto(booking: SummaryRow): BookingSummaryDto {
  return {
    id: booking.id,
    customerId: booking.customerId,
    customerName: booking.customer.name,
    packageId: booking.packageId,
    packageTitle: booking.package.title,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    totalAmount: booking.totalAmount.toNumber(),
    currency: booking.currency,
    travelStartDate: booking.travelStartDate?.toISOString() ?? null,
    travelEndDate: booking.travelEndDate?.toISOString() ?? null,
    consultantId: booking.consultantId,
    consultantName: booking.consultant?.name ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}
