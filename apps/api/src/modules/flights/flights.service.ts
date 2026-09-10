import { randomUUID } from "node:crypto";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type {
  CreateFlightBookingRequestDto,
  FlightApiStatusDto,
  FlightBookingDto,
  FlightOptionDto,
  FlightPaymentOrderDto,
  FlightPriceCheckDto,
  FlightSearchResultDto,
  VerifyFlightPaymentDto,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RazorpayService } from "../customer-portal/razorpay.service";
import { FtdClientService } from "./ftd-client.service";
import { FlightPricingService } from "./flight-pricing.service";
import { extractFlightSnapshot, mapBookingResponse, mapCancelResponse, mapPriceCheck, mapSearchOrFareDetails } from "./flight-response-mapper";
import type { SearchFlightDto } from "./dto/search-flight.dto";
import type { CreateFlightBookingDto } from "./dto/create-flight-booking.dto";

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ftd: FtdClientService,
    private readonly razorpay: RazorpayService,
    private readonly pricing: FlightPricingService,
  ) {}

  /** Applies our margin/discount in place, keyed off the leg data actually returned (not the search
   * request), so a connecting flight's true origin/destination decides which route rule applies. */
  private async applyMarginToOptions(options: FlightOptionDto[]): Promise<FlightOptionDto[]> {
    return Promise.all(
      options.map(async (option) => {
        const depCity = option.legs[0]?.depCode ?? "";
        const arrCity = option.legs[option.legs.length - 1]?.arrCode ?? "";
        const margin = await this.pricing.getEffectiveMargin(depCity, arrCity, option.legs[0]?.airlineCode, option.legs[0]?.flightNo);
        return { ...option, fare: this.pricing.applyMargin(option.fare, margin) };
      }),
    );
  }

  async apiStatus(): Promise<FlightApiStatusDto> {
    const configured = await this.ftd.isConfigured();
    let balance: string | null = null;
    if (configured) {
      try {
        balance = (await this.ftd.balance()).balance;
      } catch {
        balance = null;
      }
    }
    return { configured, mode: Number(process.env.FTD_MODE ?? "0"), balance };
  }

  async search(dto: SearchFlightDto): Promise<FlightSearchResultDto> {
    const raw = await this.ftd.search({ ...dto, reDate: dto.reDate ?? "", refID: dto.refID ?? "" });
    const mapped = mapSearchOrFareDetails(raw);
    return { ...mapped, options: await this.applyMarginToOptions(mapped.options) };
  }

  async fareDetails(flightID: number, refID: string): Promise<FlightSearchResultDto> {
    const raw = await this.ftd.fareDetails(flightID, refID);
    const mapped = mapSearchOrFareDetails(raw);
    return { ...mapped, options: await this.applyMarginToOptions(mapped.options) };
  }

  /** Returns both the customer-facing (margin-applied) DTO and the provider's own total, the
   * latter needed only internally by createDraftBooking to record the real fare for transparency. */
  private async priceCheckInternal(flightID: number, refID: string): Promise<{ dto: FlightPriceCheckDto; providerTotal: number }> {
    const raw = await this.ftd.priceCheck(flightID, refID);
    const mapped = mapPriceCheck(raw);
    const providerTotal = mapped.option.fare.total;
    const depCity = mapped.option.legs[0]?.depCode ?? "";
    const arrCity = mapped.option.legs[mapped.option.legs.length - 1]?.arrCode ?? "";
    const margin = await this.pricing.getEffectiveMargin(depCity, arrCity, mapped.option.legs[0]?.airlineCode, mapped.option.legs[0]?.flightNo);
    mapped.option = { ...mapped.option, fare: this.pricing.applyMargin(mapped.option.fare, margin) };
    return { dto: mapped, providerTotal };
  }

  async priceCheck(flightID: number, refID: string): Promise<FlightPriceCheckDto> {
    return (await this.priceCheckInternal(flightID, refID)).dto;
  }

  async fareRules(flightID: number): Promise<Record<string, unknown>> {
    return this.ftd.fareRules(flightID);
  }

  /**
   * Creates our own booking record and freezes the price at this moment (re-verified against the
   * provider, never trusted from the client) — this is the DRAFT the customer pays for. Nothing is
   * booked with the provider yet; that only happens after payment clears, in confirmBooking().
   */
  async createDraftBooking(tenantId: string, customerId: string, dto: CreateFlightBookingDto, searchContext: SearchFlightDto): Promise<FlightBookingDto> {
    // Per the FTD spec, "Domestic Round Trip are two One Way bookings" — a single domestic search/price-check
    // with tripType=1 only ever returns onward-leg data, so a booking made against it would silently charge
    // and confirm only the onward flight while looking like a round trip. Block it here as a hard safety net
    // (the UI already prevents selecting this combination) rather than let a crafted request through.
    if (searchContext.tripType === 1 && searchContext.serType === 1) {
      throw new BadRequestException({
        code: "DOMESTIC_ROUND_TRIP_UNSUPPORTED",
        message: "Domestic round trips must be booked as two separate one-way flights. Please search and book your return trip separately.",
      });
    }
    const { dto: priceCheck, providerTotal } = await this.priceCheckInternal(dto.flightID, dto.refID);
    if (!priceCheck.option.id) {
      throw new BadRequestException({ code: "FLIGHT_UNAVAILABLE", message: "This flight is no longer available. Please search again." });
    }
    if (dto.passengers.length === 0) {
      throw new BadRequestException({ code: "NO_PASSENGERS", message: "At least one passenger is required." });
    }

    const totalAmount = priceCheck.option.fare.total;

    const booking = await this.prisma.flightBooking.create({
      data: {
        tenantId,
        customerId,
        clientId: randomUUID(),
        refId: dto.refID,
        flightId: String(dto.flightID),
        tripType: searchContext.tripType,
        serType: searchContext.serType,
        depCity: searchContext.depCity,
        arrCity: searchContext.arrCity,
        onDate: searchContext.onDate,
        reDate: searchContext.reDate ?? null,
        adt: searchContext.adt,
        chd: searchContext.chd,
        inf: searchContext.inf,
        providerFareAmount: providerTotal,
        cabin: searchContext.cabin,
        fareType: searchContext.fareType,
        searchSnapshot: searchContext as unknown as object,
        fareSnapshot: priceCheck as unknown as object,
        totalAmount,
        currency: "INR",
        status: "DRAFT",
        paymentStatus: "PENDING",
        passengers: {
          create: dto.passengers.map((p) => ({
            title: p.title,
            fName: p.fName,
            lName: p.lName,
            pType: p.pType,
            gender: p.gender,
            dob: p.dob,
            documentId: p.documentId,
            ppNo: p.ppNo,
            ppIss: p.ppIss,
            ppExp: p.ppExp,
            ppNat: p.ppNat,
          })),
        },
        statusHistory: { create: { toStatus: "DRAFT", note: "Booking draft created, price locked in" } },
      },
      include: { passengers: true },
    });

    // Stash the contact/GST/PAN details needed at the actual FTD book() call for confirmBooking().
    await this.prisma.flightBooking.update({
      where: { id: booking.id },
      data: { fareSnapshot: { ...(priceCheck as object), _bookingInput: dto } as unknown as object },
    });

    return this.toDto(booking);
  }

  async createPaymentOrder(tenantId: string, customerId: string, flightBookingId: string): Promise<FlightPaymentOrderDto> {
    const booking = await this.getOwned(tenantId, customerId, flightBookingId);
    if (booking.paymentStatus === "PAID") {
      throw new BadRequestException({ code: "ALREADY_PAID", message: "This booking is already paid." });
    }

    const payment = await this.prisma.flightPayment.create({
      data: { tenantId, flightBookingId: booking.id, amount: booking.totalAmount, provider: "razorpay" },
    });
    const order = await this.razorpay.createOrder(tenantId, booking.totalAmount.toNumber(), booking.currency, payment.id);
    await this.prisma.flightPayment.update({ where: { id: payment.id }, data: { providerRef: order.orderId } });
    await this.prisma.flightBooking.update({ where: { id: booking.id }, data: { status: "PENDING_PAYMENT" } });

    return { paymentId: payment.id, orderId: order.orderId, amount: order.amount, currency: order.currency, keyId: order.keyId, mock: order.mock };
  }

  /** Verifies payment, then — only once payment is secured — books with the provider for real. */
  async confirmBooking(tenantId: string, customerId: string, flightBookingId: string, paymentId: string, dto: VerifyFlightPaymentDto): Promise<FlightBookingDto> {
    const booking = await this.getOwned(tenantId, customerId, flightBookingId);
    const payment = await this.prisma.flightPayment.findFirst({ where: { id: paymentId, flightBookingId: booking.id, tenantId } });
    if (!payment) throw new NotFoundException({ code: "PAYMENT_NOT_FOUND", message: "Payment does not exist." });

    if (await this.razorpay.isConfigured(tenantId)) {
      if (!dto.razorpayOrderId || !dto.razorpayPaymentId || !dto.razorpaySignature) {
        throw new BadRequestException({ code: "PAYMENT_VERIFICATION_INCOMPLETE", message: "Missing payment verification fields." });
      }
      const valid = await this.razorpay.verifySignature(tenantId, dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
      if (!valid) throw new UnauthorizedException({ code: "PAYMENT_SIGNATURE_INVALID", message: "Payment verification failed." });
    } else if (!dto.devConfirm) {
      throw new BadRequestException({ code: "PAYMENT_NOT_CONFIRMED", message: "Payment was not confirmed." });
    }

    await this.prisma.flightPayment.update({
      where: { id: payment.id },
      data: { status: "CAPTURED", capturedAt: new Date(), method: dto.razorpayPaymentId ? "razorpay" : "dev", providerPaymentId: dto.razorpayPaymentId ?? null },
    });
    await this.prisma.flightBooking.update({ where: { id: booking.id }, data: { paymentStatus: "PAID" } });

    return this.bookWithProvider(tenantId, customerId, booking.id);
  }

  private async bookWithProvider(tenantId: string, customerId: string, flightBookingId: string): Promise<FlightBookingDto> {
    const booking = await this.prisma.flightBooking.findFirstOrThrow({ where: { id: flightBookingId, tenantId, customerId }, include: { passengers: true } });
    const snapshot = booking.fareSnapshot as unknown as { _bookingInput?: CreateFlightBookingDto };
    const input = snapshot?._bookingInput;
    if (!input) {
      await this.markFailed(booking.id, "Missing original booking details — cannot complete booking with the provider.");
      throw new BadRequestException({ code: "BOOKING_INPUT_MISSING", message: "Could not complete this booking. Please contact support." });
    }

    const payload = {
      passenger: booking.passengers.map((p) => ({
        title: p.title,
        fName: p.fName,
        lName: p.lName,
        pType: p.pType,
        gender: p.gender,
        dob: p.dob,
        ...(p.documentId ? { document_id: p.documentId } : {}),
        ...(p.ppNo ? { ppNo: p.ppNo, ppIss: p.ppIss, ppExp: p.ppExp, ppNat: p.ppNat } : {}),
      })),
      refID: booking.refId,
      clientID: booking.clientId,
      flightID: Number(booking.flightId),
      mobile: input.mobile,
      email: input.email,
      ...(input.firstPaxPanNo ? { first_pax_pan_no: input.firstPaxPanNo } : {}),
      ...(input.webCheckin ? { web_checkin: 1 } : {}),
      ...(input.gst ? { gst: input.gst } : {}),
    };

    try {
      const raw = await this.ftd.book(payload);
      const mapped = mapBookingResponse(raw);
      if (!mapped.success) {
        await this.markFailed(booking.id, mapped.errorDesc || "The flight provider could not complete this booking.");
        return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
      }

      const newStatus = mapped.status.toLowerCase() === "success" ? "CONFIRMED" : "PENDING_CONFIRMATION";
      const firstPnr = mapped.onward?.passengers[0]?.pnr ?? null;

      await this.prisma.$transaction([
        this.prisma.flightBooking.update({
          where: { id: booking.id },
          data: { status: newStatus, providerStatus: mapped.status, pnr: firstPnr },
        }),
        this.prisma.flightBookingStatusHistory.create({
          data: { flightBookingId: booking.id, fromStatus: "PENDING_PAYMENT", toStatus: newStatus, note: `Provider status: ${mapped.status}` },
        }),
        ...(mapped.onward?.passengers ?? []).map((p, idx) =>
          this.prisma.flightPassenger.update({
            where: { id: booking.passengers[idx]?.id },
            data: { paxId: p.paxId, pnr: p.pnr, ticketNo: p.ticketNo, barcodeText1: p.barcodeText1, barcodeText2: p.barcodeText2, barcodeText3: p.barcodeText3 },
          }),
        ),
      ]);

      return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reach the flight provider.";
      await this.markFailed(booking.id, message);
      throw err;
    }
  }

  private async markFailed(flightBookingId: string, message: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.flightBooking.update({ where: { id: flightBookingId }, data: { status: "FAILED", errorMessage: message } }),
      this.prisma.flightBookingStatusHistory.create({ data: { flightBookingId, toStatus: "FAILED", note: message } }),
    ]);
  }

  async findAllForCustomer(tenantId: string, customerId: string): Promise<FlightBookingDto[]> {
    const bookings = await this.prisma.flightBooking.findMany({
      where: { tenantId, customerId },
      include: { passengers: true },
      orderBy: { createdAt: "desc" },
    });
    return bookings.map((b) => this.toDto(b));
  }

  async findOneForCustomer(tenantId: string, customerId: string, id: string): Promise<FlightBookingDto> {
    const booking = await this.getOwned(tenantId, customerId, id);
    return this.toDto(booking);
  }

  /** Re-polls provider status for a booking stuck in PENDING_CONFIRMATION — rate-limited to once per 5 min per the provider's own guidance (poll no more than every 7 min). */
  async refreshStatus(tenantId: string, customerId: string, id: string): Promise<FlightBookingDto> {
    const booking = await this.getOwned(tenantId, customerId, id);
    if (booking.status !== "PENDING_CONFIRMATION" || !booking.refId) return this.toDto(booking);
    if (Date.now() - booking.updatedAt.getTime() < 5 * 60 * 1000) return this.toDto(booking);

    const raw = await this.ftd.bookingStatus(booking.refId);
    const mapped = mapBookingResponse(raw);
    const newStatus = mapped.status.toLowerCase() === "success" ? "CONFIRMED" : mapped.status.toLowerCase() === "rejected" ? "FAILED" : "PENDING_CONFIRMATION";
    if (newStatus !== booking.status) {
      await this.prisma.$transaction([
        this.prisma.flightBooking.update({ where: { id: booking.id }, data: { status: newStatus, providerStatus: mapped.status, pnr: mapped.onward?.passengers[0]?.pnr ?? booking.pnr } }),
        this.prisma.flightBookingStatusHistory.create({ data: { flightBookingId: booking.id, fromStatus: booking.status, toStatus: newStatus, note: `Provider status refresh: ${mapped.status}` } }),
      ]);
    } else {
      await this.prisma.flightBooking.update({ where: { id: booking.id }, data: { updatedAt: new Date() } });
    }
    return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
  }

  private static readonly CANCELLABLE_STATUSES = new Set(["CONFIRMED", "PENDING_CONFIRMATION"]);

  /**
   * Cancels every passenger on a booking via FTD's cancelFlight — a single, irreversible call (the
   * spec is explicit: "Once the cancel request is submitted, it cannot be stopped"). `customerId`
   * null means an admin-initiated cancellation (no ownership check); otherwise the booking must
   * belong to that customer. cancelFlight reports per-passenger status only ("Cancelled" or "Pending
   * Cancelled") and — unlike a normal booking — never reports a refund amount at all, so the actual
   * money-back-to-customer step is a separate, admin-approved Razorpay refund (see AdminFlightBookingsService).
   */
  async cancelBooking(tenantId: string, customerId: string | null, flightBookingId: string, reason: string, canMode = 5): Promise<FlightBookingDto> {
    const booking = customerId
      ? await this.getOwned(tenantId, customerId, flightBookingId)
      : await this.prisma.flightBooking.findFirst({ where: { id: flightBookingId, tenantId }, include: { passengers: true } });
    if (!booking) throw new NotFoundException({ code: "FLIGHT_BOOKING_NOT_FOUND", message: "Booking does not exist." });

    if (!FlightsService.CANCELLABLE_STATUSES.has(booking.status)) {
      throw new BadRequestException({ code: "CANCELLATION_NOT_ALLOWED", message: `A booking with status ${booking.status} cannot be cancelled.` });
    }
    if (!booking.refId) {
      throw new BadRequestException({ code: "MISSING_REF_ID", message: "This booking is missing its provider reference and cannot be cancelled automatically. Please contact support." });
    }
    const paxIds = booking.passengers.map((p) => p.paxId).filter((id): id is string => Boolean(id));
    if (paxIds.length === 0) {
      throw new BadRequestException({ code: "NO_PROVIDER_PAX_ID", message: "This booking has no provider passenger IDs on file and cannot be cancelled automatically. Please contact support." });
    }

    const raw = await this.ftd.cancel({ refID: booking.refId, paxId: paxIds.join(","), paxIdr: "", canMode, canRemarks: reason });
    const mapped = mapCancelResponse(raw);
    const allCancelled = mapped.passengers.length > 0 && mapped.passengers.every((p) => p.cancelStatus.toLowerCase() === "cancelled");
    const newStatus = allCancelled ? "CANCELLED" : "CANCELLATION_PENDING";
    const statusSummary = mapped.passengers.map((p) => p.cancelStatus).join(", ") || mapped.status;

    await this.prisma.$transaction([
      this.prisma.flightBooking.update({
        where: { id: booking.id },
        data: { status: newStatus, cancellationReason: reason, cancellationStatus: statusSummary, cancelledAt: allCancelled ? new Date() : null },
      }),
      this.prisma.flightBookingStatusHistory.create({
        data: { flightBookingId: booking.id, fromStatus: booking.status, toStatus: newStatus, note: `Cancellation requested (${reason}) — provider: ${statusSummary}` },
      }),
    ]);

    return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
  }

  private async getOwned(tenantId: string, customerId: string, id: string) {
    const booking = await this.prisma.flightBooking.findFirst({ where: { id, tenantId, customerId }, include: { passengers: true } });
    if (!booking) throw new NotFoundException({ code: "FLIGHT_BOOKING_NOT_FOUND", message: "Booking does not exist." });
    return booking;
  }

  private toDto(b: {
    id: string; clientId: string; refId: string | null; depCity: string; arrCity: string; onDate: string; reDate: string | null; adt: number; chd: number; inf: number; cabin: string;
    fareSnapshot: unknown;
    providerFareAmount: { toNumber(): number } | null; totalAmount: { toNumber(): number }; currency: string; status: string; paymentStatus: string; pnr: string | null;
    providerStatus: string | null; errorMessage: string | null; cancellationReason: string | null; cancellationStatus: string | null; cancelledAt: Date | null;
    refundAmount: { toNumber(): number } | null; refundedAt: Date | null; refundReference: string | null; createdAt: Date; updatedAt: Date;
    passengers: Array<{ id: string; title: string; fName: string; lName: string; pType: string; gender: string; dob: string; documentId: string | null; ppNo: string | null; ppNat: string | null; paxId: string | null; pnr: string | null; ticketNo: string | null }>;
  }): FlightBookingDto {
    const snapshot = extractFlightSnapshot(b.fareSnapshot);
    return {
      id: b.id,
      clientId: b.clientId,
      refId: b.refId,
      depCity: b.depCity,
      arrCity: b.arrCity,
      onDate: b.onDate,
      reDate: b.reDate,
      adt: b.adt,
      chd: b.chd,
      inf: b.inf,
      cabin: b.cabin,
      legs: snapshot.legs,
      returnLegs: snapshot.returnLegs,
      fare: snapshot.fare,
      providerFareAmount: b.providerFareAmount ? b.providerFareAmount.toNumber() : null,
      totalAmount: b.totalAmount.toNumber(),
      currency: b.currency,
      status: b.status as FlightBookingDto["status"],
      paymentStatus: b.paymentStatus as FlightBookingDto["paymentStatus"],
      pnr: b.pnr,
      providerStatus: b.providerStatus,
      errorMessage: b.errorMessage,
      cancellationReason: b.cancellationReason,
      cancellationStatus: b.cancellationStatus,
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
      refundAmount: b.refundAmount ? b.refundAmount.toNumber() : null,
      refundedAt: b.refundedAt ? b.refundedAt.toISOString() : null,
      refundReference: b.refundReference,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      passengers: b.passengers.map((p) => ({
        id: p.id,
        title: p.title,
        fName: p.fName,
        lName: p.lName,
        pType: p.pType,
        gender: p.gender,
        dob: p.dob,
        documentId: p.documentId,
        ppNo: p.ppNo,
        ppNat: p.ppNat,
        paxId: p.paxId,
        pnr: p.pnr,
        ticketNo: p.ticketNo,
      })),
    };
  }
}
