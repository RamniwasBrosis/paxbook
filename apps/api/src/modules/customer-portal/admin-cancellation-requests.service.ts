import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CancellationRequestDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { BookingsService } from "../bookings/bookings.service";
import { CustomerNotificationsService } from "./customer-notifications.service";
import { toCancellationRequestDto } from "./customer-bookings.service";
import type { ResolveCancellationRequestDto } from "./dto/resolve-cancellation-request.dto";

/** Admin-side view/resolution of customer-submitted cancellation requests. Lives in customer-portal (not bookings) so BookingsModule never has to depend back on this module. */
@Injectable()
export class AdminCancellationRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: CustomerNotificationsService,
  ) {}

  async findAll(tenantId: string): Promise<CancellationRequestDto[]> {
    const requests = await this.prisma.cancellationRequest.findMany({
      where: { booking: { tenantId } },
      include: { customer: { select: { name: true } } },
      orderBy: { requestedAt: "desc" },
    });
    return requests.map(toCancellationRequestDto);
  }

  async resolve(tenantId: string, adminId: string, id: string, dto: ResolveCancellationRequestDto): Promise<CancellationRequestDto> {
    const existing = await this.prisma.cancellationRequest.findFirst({ where: { id, booking: { tenantId } } });
    if (!existing) {
      throw new NotFoundException({ code: "CANCELLATION_REQUEST_NOT_FOUND", message: "Cancellation request does not exist." });
    }
    if (existing.status !== "REQUESTED") {
      throw new BadRequestException({ code: "CANCELLATION_ALREADY_RESOLVED", message: "This request has already been resolved." });
    }

    const updated = await this.prisma.cancellationRequest.update({
      where: { id },
      data: { status: dto.status, resolvedAt: new Date(), resolutionNote: dto.resolutionNote },
      include: { customer: { select: { name: true } } },
    });

    if (dto.status === "APPROVED") {
      await this.bookingsService.setStatus(tenantId, existing.bookingId, adminId, {
        toStatus: "CANCELLED",
        note: "Cancelled via customer cancellation request",
      });
    }

    await this.notificationsService.create(
      tenantId,
      existing.customerId,
      "CANCELLATION",
      dto.status === "APPROVED" ? "Cancellation approved" : "Cancellation request rejected",
      dto.status === "APPROVED"
        ? "Your cancellation request has been approved and the booking has been cancelled."
        : `Your cancellation request was not approved.${dto.resolutionNote ? ` Note: ${dto.resolutionNote}` : ""}`,
    );

    return toCancellationRequestDto(updated);
  }
}
