import { randomUUID } from "node:crypto";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AdminFlightSearchResultDto,
  CreateFlightBookingRequestDto,
  FareRulesDto,
  FlightApiStatusDto,
  FlightBaggageOptionDto,
  FlightBookingDto,
  FlightCancellationEstimateDto,
  FlightMealOptionDto,
  FlightOptionDto,
  FlightPaymentOrderDto,
  FlightPriceCheckDto,
  FlightSearchResultDto,
  FlightSeatLookupResultDto,
  FlightSeatOptionDto,
  FlightTripDto,
  VerifyFlightPaymentDto,
} from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RazorpayService } from "../customer-portal/razorpay.service";
import { CustomerNotificationsService } from "../customer-portal/customer-notifications.service";
import { EmailService } from "../../common/email/email.service";
import { SmsService } from "../../common/sms/sms.service";
import { FtdClientService } from "./ftd-client.service";
import { FlightPricingService } from "./flight-pricing.service";
import { FlightCancellationEstimateService } from "./flight-cancellation-estimate.service";
import { extractFlightSnapshot, mapBookingResponse, mapCancelResponse, mapFareRules, mapPriceCheck, mapRescheduleResponse, mapSearchOrFareDetails, mapSeats } from "./flight-response-mapper";
import { buildBookingConfirmedEmailHtml } from "./flight-email-templates";
import { buildTicketPdf } from "./flight-ticket-pdf";
import type { SearchFlightDto } from "./dto/search-flight.dto";
import type { CreateFlightBookingDto, FlightSsrSelectionDto } from "./dto/create-flight-booking.dto";
import type { FlightSeatLookupPassengerDto } from "./dto/flight-seat-lookup.dto";
import type { CreateRoundTripFlightBookingDto } from "./dto/create-round-trip-flight-booking.dto";

/** What one passenger ended up with for one leg direction, after re-validating their submitted
 * baggage/meal/seat ids against a fresh provider lookup — this is what gets stashed in
 * fareSnapshot._resolvedSsr and replayed into FTD's ssrInfo block at confirm-time. */
interface ResolvedSsrLeg {
  baggage?: FlightBaggageOptionDto;
  meals: FlightMealOptionDto[];
  seat?: FlightSeatOptionDto;
}
interface ResolvedSsrByPassenger {
  onward?: ResolvedSsrLeg;
  return?: ResolvedSsrLeg;
}

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ftd: FtdClientService,
    private readonly razorpay: RazorpayService,
    private readonly pricing: FlightPricingService,
    private readonly cancellationEstimate: FlightCancellationEstimateService,
    private readonly notifications: CustomerNotificationsService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  /** Applies our margin/discount in place, keyed off the leg data actually returned (not the search
   * request), so a connecting flight's true origin/destination decides which route rule applies. */
  private async applyMarginToOptions(options: FlightOptionDto[]): Promise<FlightOptionDto[]> {
    return Promise.all(
      options.map(async (option) => {
        const depCity = option.legs[0]?.depCode ?? "";
        const arrCity = option.legs[option.legs.length - 1]?.arrCode ?? "";
        const margin = await this.pricing.getEffectiveMargin(depCity, arrCity, option.legs[0]?.airlineCode, option.legs[0]?.flightNo, option.legs[0]?.cabin);
        return { ...option, fare: this.pricing.applyMargin(option.fare, margin) };
      }),
    );
  }

  /** Admin-only: same live search, but keeps the provider's real (pre-margin) fare alongside the
   * customer-facing one and the exact margin that produced it — the public/customer search never
   * exposes provider cost, so this is a separate method rather than a flag on the shared one. */
  async adminSearchWithProviderFare(dto: SearchFlightDto): Promise<AdminFlightSearchResultDto> {
    const raw = await this.ftd.search({ ...dto, reDate: dto.reDate ?? "", refID: dto.refID ?? "" });
    const mapped = mapSearchOrFareDetails(raw);
    const options = await Promise.all(
      mapped.options.map(async (option) => {
        const depCity = option.legs[0]?.depCode ?? "";
        const arrCity = option.legs[option.legs.length - 1]?.arrCode ?? "";
        const margin = await this.pricing.getEffectiveMargin(depCity, arrCity, option.legs[0]?.airlineCode, option.legs[0]?.flightNo, option.legs[0]?.cabin);
        const providerFareTotal = option.fare.total;
        return {
          ...option,
          fare: this.pricing.applyMargin(option.fare, margin),
          providerFareTotal,
          effectiveMarginPercent: margin.marginPercent,
          effectiveMarginFlat: margin.marginFlat,
          effectiveMarginType: margin.marginType,
        };
      }),
    );
    return { refId: mapped.refId, isComplete: mapped.isComplete, options };
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
    const margin = await this.pricing.getEffectiveMargin(depCity, arrCity, mapped.option.legs[0]?.airlineCode, mapped.option.legs[0]?.flightNo, mapped.option.legs[0]?.cabin);
    mapped.option = { ...mapped.option, fare: this.pricing.applyMargin(mapped.option.fare, margin) };
    return { dto: mapped, providerTotal };
  }

  async priceCheck(flightID: number, refID: string): Promise<FlightPriceCheckDto> {
    return (await this.priceCheckInternal(flightID, refID)).dto;
  }

  async fareRules(flightID: number): Promise<Record<string, unknown>> {
    return this.ftd.fareRules(flightID);
  }

  /** Real cancellation/fare terms for a customer to read before booking — same underlying FTD call
   * and mapper the cancellation-estimate feature uses, just exposed publicly and typed instead of
   * the raw passthrough `fareRules()` above (which stays raw for the admin debugging tool). */
  async fareRulesForCustomer(flightID: number): Promise<FareRulesDto> {
    return mapFareRules(await this.ftd.fareRules(flightID));
  }

  /** Real seat-map lookup — needs actual passenger names (an FTD requirement), so unlike
   * price-check's bundled baggage/meal data this is its own on-demand call, made only once names are
   * typed. No margin applied — seat prices pass through from FTD unmodified, same as baggage/meal. */
  async seats(flightID: number, refID: string, passengers: FlightSeatLookupPassengerDto[]): Promise<FlightSeatLookupResultDto> {
    const raw = await this.ftd.seats(
      flightID,
      refID,
      passengers.map((p) => ({ title: p.title, fName: p.fName, lName: p.lName, pType: p.pType })),
    );
    return mapSeats(raw);
  }

  /** "All" matches any passenger; "Adult"/"Child" only match that exact pType. FTD's SSR options
   * come tagged this way (baggage/meal/seat all use it), and infants ("I") are never offered these
   * add-ons by the provider. */
  private ssrPaxTypeMatches(optionPaxType: "Adult" | "Child" | "All", pType: string): boolean {
    if (optionPaxType === "All") return true;
    if (optionPaxType === "Adult") return pType === "A";
    if (optionPaxType === "Child") return pType === "C";
    return false;
  }

  /**
   * Re-validates every baggage/meal id a customer submitted against the SSR options this exact
   * request's own price-check just quoted — never trusts a client-supplied amount (there isn't one
   * to trust; the DTO only carries ids) and never trusts a stale/cached option list. Also enforces
   * the fare's own baggageMandatory/mealMandatory flags now that these are real, selectable options
   * rather than a blanket UI block. Returns the real total to add to the booking plus, per passenger,
   * the resolved option objects bookWithProvider() needs later to build FTD's ssrInfo block.
   */
  private resolveSsrSelection(
    dto: CreateFlightBookingDto,
    priceCheck: FlightPriceCheckDto,
  ): { total: number; resolved: ResolvedSsrByPassenger[] } {
    const ssr = priceCheck.ssr;
    const validation = priceCheck.option.validation;
    let total = 0;

    const resolveLeg = (
      idx: number,
      pType: string,
      sel: FlightSsrSelectionDto | undefined,
      legOptions: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] } | undefined,
      label: string | undefined,
    ) => {
      if (!legOptions) return undefined;
      let baggage: FlightBaggageOptionDto | undefined;
      if (sel?.baggageId) {
        baggage = legOptions.baggage.find((b) => b.id === sel.baggageId);
        if (!baggage || !this.ssrPaxTypeMatches(baggage.paxType, pType)) {
          throw new BadRequestException({ code: "SSR_BAGGAGE_INVALID", message: `Passenger ${idx + 1}: the selected baggage option is no longer available for this fare.` });
        }
        total += baggage.amount;
      } else if (validation.baggageMandatory && legOptions.baggage.length > 0) {
        throw new BadRequestException({
          code: "SSR_BAGGAGE_REQUIRED",
          message: `Passenger ${idx + 1}: this fare requires selecting a baggage option${label ? ` for the ${label} flight` : ""}.`,
        });
      }

      const meals: FlightMealOptionDto[] = [];
      for (const mealId of sel?.mealIds ?? []) {
        const meal = legOptions.meals.find((m) => m.id === mealId);
        if (!meal || !this.ssrPaxTypeMatches(meal.paxType, pType)) {
          throw new BadRequestException({ code: "SSR_MEAL_INVALID", message: `Passenger ${idx + 1}: a selected meal option is no longer available for this fare.` });
        }
        meals.push(meal);
        total += meal.amount;
      }
      if (meals.length === 0 && validation.mealMandatory && legOptions.meals.length > 0) {
        throw new BadRequestException({
          code: "SSR_MEAL_REQUIRED",
          message: `Passenger ${idx + 1}: this fare requires selecting a meal option${label ? ` for the ${label} flight` : ""}.`,
        });
      }

      return baggage || meals.length > 0 ? { baggage, meals } : undefined;
    };

    const resolved = dto.passengers.map((p, idx) => ({
      onward: resolveLeg(idx, p.pType, p.ssr?.onward, ssr?.onward, ssr?.return ? "departure" : undefined),
      return: ssr?.return ? resolveLeg(idx, p.pType, p.ssr?.return, ssr.return, "return") : undefined,
    }));

    return { total, resolved };
  }

  /**
   * Real seat-map validation — structurally different from baggage/meal because FTD's seat lookup
   * is its own call (needs passenger names, isn't bundled in price-check) rather than data already
   * in hand. Short-circuits before ever calling FTD if nobody selected a seat, so bookings that don't
   * touch this feature pay zero extra latency. When seats ARE requested, re-fetches a fresh map
   * (never trusts a stale one), rejects an id that's missing/taken/pax-type-mismatched, and rejects
   * two passengers claiming the same seat in one submission — the DTO has no uniqueness constraint
   * of its own, so this has to be enforced here.
   */
  private async resolveSeatSelection(
    dto: CreateFlightBookingDto,
    priceCheck: FlightPriceCheckDto,
  ): Promise<{ total: number; resolved: Array<{ onward?: FlightSeatOptionDto; return?: FlightSeatOptionDto }> }> {
    const validation = priceCheck.option.validation;
    const hasReturn = Boolean(priceCheck.option.returnLegs);
    const anySeatRequested = dto.passengers.some((p) => p.ssr?.onward?.seatId || p.ssr?.return?.seatId);

    if (!anySeatRequested) {
      if (validation.seatMandatory) {
        throw new BadRequestException({
          code: "SEAT_MAP_UNAVAILABLE",
          message: "This fare requires selecting a seat. Please go back and choose a seat, or contact our travel desk to complete this booking manually.",
        });
      }
      return { total: 0, resolved: dto.passengers.map(() => ({})) };
    }

    let seatMap: FlightSeatLookupResultDto;
    try {
      seatMap = await this.seats(
        dto.flightID,
        dto.refID,
        dto.passengers.map((p) => ({ title: p.title, fName: p.fName, lName: p.lName, pType: p.pType })),
      );
    } catch {
      throw new BadRequestException({
        code: "SEAT_MAP_UNAVAILABLE",
        message: "Could not retrieve seat availability for this flight. Please try again or contact our travel desk.",
      });
    }

    const flatten = (maps: typeof seatMap.onward | undefined) => (maps ?? []).flatMap((m) => m.seatMap);
    const onwardSeats = flatten(seatMap.onward);
    const returnSeats = flatten(seatMap.return);

    if (validation.seatMandatory && onwardSeats.length === 0 && (!hasReturn || returnSeats.length === 0)) {
      throw new BadRequestException({
        code: "SEAT_MAP_UNAVAILABLE",
        message: "This fare requires selecting a seat, but seat availability could not be retrieved for it. Please try a different fare or contact our travel desk.",
      });
    }

    let total = 0;
    const claimedOnward = new Set<string>();
    const claimedReturn = new Set<string>();

    const resolveLeg = (idx: number, pType: string, seatId: string | undefined, seats: FlightSeatOptionDto[], claimed: Set<string>, label: string | undefined): FlightSeatOptionDto | undefined => {
      if (!seatId) {
        // Infants never get their own seat (they travel on a lap) — FTD doesn't offer them one, so
        // a seat-mandatory fare can't reasonably demand one either.
        if (validation.seatMandatory && seats.length > 0 && pType !== "I") {
          throw new BadRequestException({
            code: "SEAT_REQUIRED",
            message: `Passenger ${idx + 1}: this fare requires selecting a seat${label ? ` for the ${label} flight` : ""}.`,
          });
        }
        return undefined;
      }
      const seat = seats.find((s) => s.seatID === seatId);
      // isBooked: true means AVAILABLE (FTD's own inverted-sounding naming) — a false/missing seat
      // is either already taken or doesn't exist in this fresh lookup at all.
      if (!seat || !seat.isBooked || !this.ssrPaxTypeMatches(seat.paxType, pType)) {
        throw new BadRequestException({ code: "SEAT_INVALID", message: `Passenger ${idx + 1}: the selected seat is no longer available for this fare.` });
      }
      if (claimed.has(seatId)) {
        throw new BadRequestException({ code: "SEAT_ALREADY_ASSIGNED", message: `Passenger ${idx + 1}: this seat has already been selected for another passenger.` });
      }
      claimed.add(seatId);
      total += seat.seatAmt;
      return seat;
    };

    const resolved = dto.passengers.map((p, idx) => ({
      onward: resolveLeg(idx, p.pType, p.ssr?.onward?.seatId, onwardSeats, claimedOnward, hasReturn ? "departure" : undefined),
      return: hasReturn ? resolveLeg(idx, p.pType, p.ssr?.return?.seatId, returnSeats, claimedReturn, "return") : undefined,
    }));

    return { total, resolved };
  }

  /**
   * Creates our own booking record and freezes the price at this moment (re-verified against the
   * provider, never trusted from the client) — this is the DRAFT the customer pays for. Nothing is
   * booked with the provider yet; that only happens after payment clears, in confirmBooking().
   */
  async createDraftBooking(
    tenantId: string,
    customerId: string,
    dto: CreateFlightBookingDto,
    searchContext: SearchFlightDto,
    trip?: { tripId: string; tripRole: "ONWARD" | "RETURN" },
  ): Promise<FlightBookingDto> {
    // Per the FTD spec, "Domestic Round Trip are two One Way bookings" — a single domestic search/price-check
    // with tripType=1 only ever returns onward-leg data, so a booking made against it would silently charge
    // and confirm only the onward flight while looking like a round trip. Block it here as a hard safety net
    // (the UI already prevents selecting this combination) rather than let a crafted request through. A real
    // domestic round trip goes through createRoundTripDraftBooking instead, which books each direction as its
    // own one-way (tripType 0) booking linked by trip.tripId — so this guard never fires for that path.
    if (!trip && searchContext.tripType === 1 && searchContext.serType === 1) {
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

    // Real baggage/meal purchase: only ids ever come from the client, priced and validated here
    // against what the provider just quoted moments ago — see resolveSsrSelection's own comment.
    const { total: ssrTotal, resolved: resolvedSsr } = this.resolveSsrSelection(dto, priceCheck);
    // Real seat purchase: its own fresh FTD lookup (see resolveSeatSelection's own comment) — merged
    // into the same per-passenger shape below so bookWithProvider only has one structure to read back.
    const { total: seatTotal, resolved: resolvedSeats } = await this.resolveSeatSelection(dto, priceCheck);
    const mergedResolvedSsr: ResolvedSsrByPassenger[] = dto.passengers.map((_, idx) => {
      const mergeLeg = (base: ResolvedSsrLeg | undefined, seat: FlightSeatOptionDto | undefined): ResolvedSsrLeg | undefined =>
        base || seat ? { baggage: base?.baggage, meals: base?.meals ?? [], seat } : undefined;
      return {
        onward: mergeLeg(resolvedSsr[idx]?.onward, resolvedSeats[idx]?.onward),
        return: mergeLeg(resolvedSsr[idx]?.return, resolvedSeats[idx]?.return),
      };
    });
    // Real web check-in purchase: a single whole-booking flag, never per-passenger (FTD: "All PAX
    // will chosen for web checkin and partial selection is not allowed") — re-validated against the
    // same fresh price-check's own ssr.webCheckinEnabled/Amount, never trusting a client amount.
    if (dto.webCheckin && !priceCheck.ssr?.webCheckinEnabled) {
      throw new BadRequestException({ code: "WEB_CHECKIN_UNAVAILABLE", message: "Web check-in is not available for this fare." });
    }
    const webCheckinTotal = dto.webCheckin ? (priceCheck.ssr?.webCheckinAmount ?? 0) : 0;
    const totalAmount = priceCheck.option.fare.total + ssrTotal + seatTotal + webCheckinTotal;

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
        tripId: trip?.tripId ?? null,
        tripRole: trip?.tripRole ?? null,
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

    // Stash the contact/GST/PAN details needed at the actual FTD book() call for confirmBooking(),
    // plus the already-validated SSR selection (_resolvedSsr) so bookWithProvider() doesn't need to
    // re-run the id lookup against a possibly-stale re-fetch of the provider's SSR options.
    await this.prisma.flightBooking.update({
      where: { id: booking.id },
      data: { fareSnapshot: { ...(priceCheck as object), _bookingInput: dto, _resolvedSsr: mergedResolvedSsr } as unknown as object },
    });

    return this.toDto(booking);
  }

  /**
   * A domestic round trip, modeled as two linked one-way DRAFT bookings sharing a tripId (see
   * FlightBooking.tripId in schema.prisma) — each goes through the exact same createDraftBooking path
   * as a standalone one-way booking, just tagged with which half of the trip it is. Passengers, contact
   * details, PAN, and GST apply to both legs identically (the same travellers fly both directions).
   */
  async createRoundTripDraftBooking(tenantId: string, customerId: string, dto: CreateRoundTripFlightBookingDto): Promise<FlightTripDto> {
    if (dto.onward.searchContext.serType !== 1 || dto.return.searchContext.serType !== 1) {
      throw new BadRequestException({ code: "ROUND_TRIP_MUST_BE_DOMESTIC", message: "This round-trip flow is for domestic flights only." });
    }
    const tripId = randomUUID();
    // Each leg is its own one-way booking from FTD's perspective, so its own createDraftBooking()
    // only ever reads a passenger's ssr.onward — remap whichever direction this leg represents
    // (the customer's departure or return SSR/seat choice) into that slot. Without this, both legs
    // would silently resolve off the exact same ssr.onward field, making it impossible to choose
    // different baggage/meal/seats for the outbound vs return flight.
    const legInput = (leg: { flightID: number; refID: string; searchContext: SearchFlightDto }, direction: "onward" | "return"): CreateFlightBookingDto => ({
      flightID: leg.flightID,
      refID: leg.refID,
      passengers: dto.passengers.map((p) => ({ ...p, ssr: p.ssr?.[direction] ? { onward: p.ssr[direction] } : undefined })),
      mobile: dto.mobile,
      email: dto.email,
      firstPaxPanNo: dto.firstPaxPanNo,
      webCheckin: dto.webCheckin,
      gst: dto.gst,
      searchContext: leg.searchContext,
    });

    const onward = await this.createDraftBooking(tenantId, customerId, legInput(dto.onward, "onward"), dto.onward.searchContext, { tripId, tripRole: "ONWARD" });
    const returnLeg = await this.createDraftBooking(tenantId, customerId, legInput(dto.return, "return"), dto.return.searchContext, { tripId, tripRole: "RETURN" });

    return { tripId, onward, return: returnLeg, totalAmount: onward.totalAmount + returnLeg.totalAmount, currency: onward.currency };
  }

  private async getTripBookings(tenantId: string, customerId: string, tripId: string): Promise<{ onward: FlightBookingDto; return: FlightBookingDto }> {
    const bookings = await this.prisma.flightBooking.findMany({ where: { tenantId, customerId, tripId }, include: { passengers: true } });
    const onward = bookings.find((b) => b.tripRole === "ONWARD");
    const returnLeg = bookings.find((b) => b.tripRole === "RETURN");
    if (!onward || !returnLeg) throw new NotFoundException({ code: "FLIGHT_TRIP_NOT_FOUND", message: "Trip does not exist." });
    return { onward: this.toDto(onward), return: this.toDto(returnLeg) };
  }

  async getTrip(tenantId: string, customerId: string, tripId: string): Promise<FlightTripDto> {
    const { onward, return: returnLeg } = await this.getTripBookings(tenantId, customerId, tripId);
    return { tripId, onward, return: returnLeg, totalAmount: onward.totalAmount + returnLeg.totalAmount, currency: onward.currency };
  }

  /** One combined Razorpay order for both legs' total — split back into two FlightPayment rows (one
   * per booking) sharing that same order id, so refunds/cancellations still work per-leg afterward. */
  async createTripPaymentOrder(tenantId: string, customerId: string, tripId: string): Promise<FlightPaymentOrderDto> {
    const { onward, return: returnLeg } = await this.getTripBookings(tenantId, customerId, tripId);
    if (onward.paymentStatus === "PAID" || returnLeg.paymentStatus === "PAID") {
      throw new BadRequestException({ code: "ALREADY_PAID", message: "This trip is already paid." });
    }
    const combinedTotal = Math.round((onward.totalAmount + returnLeg.totalAmount) * 100) / 100;

    const onwardPayment = await this.prisma.flightPayment.create({ data: { tenantId, flightBookingId: onward.id, amount: onward.totalAmount, provider: "razorpay" } });
    const returnPayment = await this.prisma.flightPayment.create({ data: { tenantId, flightBookingId: returnLeg.id, amount: returnLeg.totalAmount, provider: "razorpay" } });

    const order = await this.razorpay.createOrder(tenantId, combinedTotal, onward.currency, `trip_${tripId}`);

    await this.prisma.$transaction([
      this.prisma.flightPayment.update({ where: { id: onwardPayment.id }, data: { providerRef: order.orderId } }),
      this.prisma.flightPayment.update({ where: { id: returnPayment.id }, data: { providerRef: order.orderId } }),
      this.prisma.flightBooking.updateMany({ where: { id: { in: [onward.id, returnLeg.id] } }, data: { status: "PENDING_PAYMENT" } }),
    ]);

    return { paymentId: onwardPayment.id, orderId: order.orderId, amount: order.amount, currency: order.currency, keyId: order.keyId, mock: order.mock };
  }

  /** Verifies the one shared payment, then books both legs with the provider — each leg's own bookWithProvider
   * call, so a failure on one side (e.g. return sells out between payment and booking) leaves the other
   * leg's real booking intact rather than losing it, matching how a single-leg failure already behaves. */
  async confirmTripBooking(tenantId: string, customerId: string, tripId: string, dto: VerifyFlightPaymentDto): Promise<FlightTripDto> {
    const { onward, return: returnLeg } = await this.getTripBookings(tenantId, customerId, tripId);
    const onwardPayment = await this.prisma.flightPayment.findFirst({ where: { flightBookingId: onward.id, tenantId }, orderBy: { createdAt: "desc" } });
    const returnPayment = await this.prisma.flightPayment.findFirst({ where: { flightBookingId: returnLeg.id, tenantId }, orderBy: { createdAt: "desc" } });
    if (!onwardPayment || !returnPayment) throw new NotFoundException({ code: "PAYMENT_NOT_FOUND", message: "Payment does not exist." });

    if (await this.razorpay.isConfigured(tenantId)) {
      if (!dto.razorpayOrderId || !dto.razorpayPaymentId || !dto.razorpaySignature) {
        throw new BadRequestException({ code: "PAYMENT_VERIFICATION_INCOMPLETE", message: "Missing payment verification fields." });
      }
      const valid = await this.razorpay.verifySignature(tenantId, dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
      if (!valid) throw new UnauthorizedException({ code: "PAYMENT_SIGNATURE_INVALID", message: "Payment verification failed." });
    } else if (!dto.devConfirm) {
      throw new BadRequestException({ code: "PAYMENT_NOT_CONFIRMED", message: "Payment was not confirmed." });
    }

    const method = dto.razorpayPaymentId ? "razorpay" : "dev";
    await this.prisma.$transaction([
      this.prisma.flightPayment.update({ where: { id: onwardPayment.id }, data: { status: "CAPTURED", capturedAt: new Date(), method, providerPaymentId: dto.razorpayPaymentId ?? null } }),
      this.prisma.flightPayment.update({ where: { id: returnPayment.id }, data: { status: "CAPTURED", capturedAt: new Date(), method, providerPaymentId: dto.razorpayPaymentId ?? null } }),
      this.prisma.flightBooking.updateMany({ where: { id: { in: [onward.id, returnLeg.id] } }, data: { paymentStatus: "PAID" } }),
    ]);

    const [bookedOnward, bookedReturn] = await Promise.all([
      this.bookWithProvider(tenantId, customerId, onward.id),
      this.bookWithProvider(tenantId, customerId, returnLeg.id),
    ]);

    return { tripId, onward: bookedOnward, return: bookedReturn, totalAmount: bookedOnward.totalAmount + bookedReturn.totalAmount, currency: bookedOnward.currency };
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
    const snapshot = booking.fareSnapshot as unknown as {
      _bookingInput?: CreateFlightBookingDto;
      _resolvedSsr?: ResolvedSsrByPassenger[];
    };
    const input = snapshot?._bookingInput;
    if (!input) {
      await this.markFailed(booking.id, "Missing original booking details — cannot complete booking with the provider.");
      throw new BadRequestException({ code: "BOOKING_INPUT_MISSING", message: "Could not complete this booking. Please contact support." });
    }
    // Positional pairing with input.passengers[idx] / _resolvedSsr[idx] — booking.passengers was
    // created from that same array via one nested create in createDraftBooking, so insertion order
    // matches; there's no other stable per-passenger key to join on (FlightPassenger.id is a random uuid).
    const resolvedSsr = snapshot?._resolvedSsr;

    const toFtdSsrLeg = (leg: ResolvedSsrLeg | undefined) => {
      if (!leg || (!leg.baggage && leg.meals.length === 0 && !leg.seat)) return undefined;
      const block: Record<string, unknown> = {};
      if (leg.baggage) block.Bagg = { baggID: leg.baggage.id, baggAmt: leg.baggage.amount, baggDesc: leg.baggage.description, paxType: leg.baggage.paxType };
      if (leg.meals.length > 0) block.Meal = leg.meals.map((m) => ({ mealID: m.id, mealAmt: m.amount, mealDesc: m.description, mealRef: m.legRef, paxType: m.paxType }));
      // Every FTD "Book with SSR" example sends Seat as a 1-element array — match that shape exactly,
      // even though this UI only ever assigns one seat per passenger per leg.
      if (leg.seat) block.Seat = [{ seatID: leg.seat.seatID, seatName: leg.seat.seatName, seatAmt: leg.seat.seatAmt, paxType: leg.seat.paxType }];
      return block;
    };

    const payload = {
      passenger: booking.passengers.map((p, idx) => {
        const ssrForPax = resolvedSsr?.[idx];
        const onward = toFtdSsrLeg(ssrForPax?.onward);
        const returnLeg = toFtdSsrLeg(ssrForPax?.return);
        return {
          title: p.title,
          fName: p.fName,
          lName: p.lName,
          pType: p.pType,
          gender: p.gender,
          dob: p.dob,
          ...(p.documentId ? { document_id: p.documentId } : {}),
          ...(p.ppNo ? { ppNo: p.ppNo, ppIss: p.ppIss, ppExp: p.ppExp, ppNat: p.ppNat } : {}),
          ...(onward || returnLeg ? { ssrInfo: { ...(onward ? { Onward: onward } : {}), ...(returnLeg ? { Return: returnLeg } : {}) } } : {}),
        };
      }),
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

      if (newStatus === "CONFIRMED") {
        await this.notifyConfirmed(tenantId, customerId, booking, firstPnr);
      }

      return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reach the flight provider.";
      await this.markFailed(booking.id, message);
      throw err;
    }
  }

  /**
   * Marks a booking FAILED and, if a payment was already captured for it, automatically refunds it
   * in full via Razorpay — unlike a voluntary cancellation, there's no fee schedule to apply here:
   * the provider never delivered a booking at all, so the whole amount always goes back. Both the
   * refund attempt and the customer alert are best-effort and must never throw back into the booking
   * flow — a failed refund/notification leaves a status-history note for admin to follow up on
   * manually via the (now FAILED-aware) admin refund endpoint, but the booking itself still ends up
   * correctly marked FAILED either way.
   */
  private async markFailed(flightBookingId: string, message: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.flightBooking.update({ where: { id: flightBookingId }, data: { status: "FAILED", errorMessage: message } }),
      this.prisma.flightBookingStatusHistory.create({ data: { flightBookingId, toStatus: "FAILED", note: message } }),
    ]);
    await this.handleFailureRefundAndAlert(flightBookingId);
  }

  /** Shared by markFailed (booking never went through) and refreshStatus (a booking that was stuck
   * PENDING_CONFIRMATION comes back REJECTED on a later poll) — either way, by the time a booking is
   * FAILED its status row is already saved; this only handles the money/notification side-effects. */
  private async handleFailureRefundAndAlert(flightBookingId: string): Promise<void> {
    const booking = await this.prisma.flightBooking.findUnique({
      where: { id: flightBookingId },
      include: { payments: { where: { status: "CAPTURED" }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!booking) return;

    let refundNote = "";
    const payment = booking.payments[0];
    if (payment?.providerPaymentId) {
      const amount = payment.amount.toNumber();
      try {
        const result = await this.razorpay.refund(booking.tenantId, payment.providerPaymentId, amount, {
          note: "Automatic refund — the flight provider could not complete this booking",
        });
        await this.prisma.$transaction([
          this.prisma.flightBooking.update({
            where: { id: flightBookingId },
            data: { paymentStatus: "REFUNDED", refundAmount: amount, refundedAt: new Date(), refundReference: result.refundId },
          }),
          this.prisma.flightPayment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } }),
          this.prisma.flightBookingStatusHistory.create({ data: { flightBookingId, toStatus: "FAILED", note: `Automatic refund of ${booking.currency} ${amount} issued (ref ${result.refundId}).` } }),
        ]);
        refundNote = `We've automatically refunded ${booking.currency} ${amount.toLocaleString("en-IN")} to your original payment method.`;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : "Unknown error.";
        await this.prisma.flightBookingStatusHistory
          .create({ data: { flightBookingId, toStatus: "FAILED", note: `Automatic refund attempt failed (${errMessage}) — needs manual admin refund.` } })
          .catch(() => undefined);
        refundNote = "Our team will process your refund shortly.";
      }
    }

    await this.alertCustomer(booking.tenantId, booking.customerId, {
      type: "FLIGHT_BOOKING_FAILED",
      title: "Flight booking could not be completed",
      inAppBody: `We couldn't complete your flight booking (${booking.depCity} → ${booking.arrCity}) on ${booking.onDate}. ${refundNote}`,
      emailSubject: "Your flight booking could not be completed",
      emailHtml: `<p>Hi,</p><p>Unfortunately we couldn't complete your flight booking from <b>${booking.depCity}</b> to <b>${booking.arrCity}</b> on ${booking.onDate}.</p><p>${refundNote}</p><p>We're sorry for the inconvenience — please contact support if you have any questions.</p>`,
      whatsappBody: `We couldn't complete your Paxbook flight booking (${booking.depCity} → ${booking.arrCity}). ${refundNote}`,
    });
  }

  private async notifyConfirmed(
    tenantId: string,
    customerId: string,
    booking: {
      id: string;
      status: string;
      createdAt: Date;
      depCity: string;
      arrCity: string;
      onDate: string;
      fareSnapshot: unknown;
      providerFareAmount: { toNumber(): number } | null;
      totalAmount: { toNumber(): number };
      currency: string;
      passengers: Array<{ title: string; fName: string; lName: string; pType: string; ticketNo: string | null; pnr: string | null }>;
    },
    resolvedPnr: string | null,
  ): Promise<void> {
    const { legs, returnLegs, fare } = extractFlightSnapshot(booking.fareSnapshot);
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { name: true } }).catch(() => null);
    const frontendUrl = this.config.get<string>("FRONTEND_URL", "http://localhost:3001");
    const ticketUrl = `${frontendUrl}/account/flight-bookings/${booking.id}/ticket`;

    // A PDF-rendering bug must never block the confirmation itself going out — worst case the
    // customer just gets the email without an attachment and can still view the ticket online.
    const pdfBuffer = await buildTicketPdf({
      status: booking.status,
      pnr: resolvedPnr,
      createdAt: booking.createdAt,
      legs,
      returnLegs,
      passengers: booking.passengers,
      fare,
      providerFareAmount: booking.providerFareAmount ? booking.providerFareAmount.toNumber() : null,
      totalAmount: booking.totalAmount.toNumber(),
      currency: booking.currency,
    }).catch(() => null);

    await this.alertCustomer(tenantId, customerId, {
      type: "FLIGHT_BOOKING_CONFIRMED",
      title: "Flight booking confirmed",
      inAppBody: `Your flight ${booking.depCity} → ${booking.arrCity} on ${booking.onDate} is confirmed. PNR: ${resolvedPnr ?? "—"}.`,
      emailSubject: "Your booking has been confirmed",
      emailHtml: buildBookingConfirmedEmailHtml({
        customerName: customer?.name ?? "Traveller",
        legs,
        passengers: booking.passengers,
        pnr: resolvedPnr,
        ticketUrl,
        hasAttachment: Boolean(pdfBuffer),
      }),
      whatsappBody: `Your Paxbook flight booking (${booking.depCity} → ${booking.arrCity}) is confirmed. PNR: ${resolvedPnr ?? "—"}. View your ticket: ${ticketUrl}`,
      emailAttachments: pdfBuffer ? [{ filename: `Paxbook-eticket-${resolvedPnr ?? booking.id}.pdf`, content: pdfBuffer, contentType: "application/pdf" }] : undefined,
    });
  }

  /** Best-effort in-app + email + WhatsApp alert for a booking lifecycle event — never allowed to
   * throw back into a booking/cancellation flow just because a notification channel had a bad moment. */
  private async alertCustomer(
    tenantId: string,
    customerId: string,
    opts: {
      type: string;
      title: string;
      inAppBody: string;
      emailSubject: string;
      emailHtml: string;
      whatsappBody: string;
      emailAttachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
    },
  ): Promise<void> {
    await this.notifications.create(tenantId, customerId, opts.type, opts.title, opts.inAppBody).catch(() => undefined);
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { email: true, phone: true } }).catch(() => null);
    if (customer?.email) {
      await this.email.send(tenantId, customer.email, opts.emailSubject, opts.emailHtml, opts.emailAttachments).catch(() => undefined);
    }
    if (customer?.phone) {
      await this.sms.sendWhatsapp(tenantId, customer.phone, opts.whatsappBody).catch(() => undefined);
    }
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
      const resolvedPnr = mapped.onward?.passengers[0]?.pnr ?? booking.pnr;
      await this.prisma.$transaction([
        this.prisma.flightBooking.update({ where: { id: booking.id }, data: { status: newStatus, providerStatus: mapped.status, pnr: resolvedPnr } }),
        this.prisma.flightBookingStatusHistory.create({ data: { flightBookingId: booking.id, fromStatus: booking.status, toStatus: newStatus, note: `Provider status refresh: ${mapped.status}` } }),
      ]);
      if (newStatus === "CONFIRMED") {
        await this.notifyConfirmed(tenantId, customerId, booking, resolvedPnr);
      } else if (newStatus === "FAILED") {
        await this.handleFailureRefundAndAlert(booking.id);
      }
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

    // A real, provider-backed refund estimate frozen at the moment cancellation is requested — real
    // airline cancellation fees are determined by when you cancel, not when an admin later processes
    // the refund. This must never block or fail the cancellation itself (already irreversible above),
    // so any failure here just leaves the estimate fields null — the admin refund flow falls back to
    // fully-manual entry exactly as before this feature existed.
    const { dto: refundEstimate, snapshot: refundEstimateSnapshot } = await this.computeEstimate(booking).catch(
      (): { dto: FlightCancellationEstimateDto; snapshot: unknown } => ({
        dto: { available: false, estimatedRefundAmount: null, cancellationFee: null, currency: booking.currency, note: "Could not compute a refund estimate for this cancellation. Our team will confirm the amount manually.", computedAt: new Date().toISOString() },
        snapshot: null,
      }),
    );

    await this.prisma.$transaction([
      this.prisma.flightBooking.update({
        where: { id: booking.id },
        data: {
          status: newStatus,
          cancellationReason: reason,
          cancellationStatus: statusSummary,
          cancelledAt: allCancelled ? new Date() : null,
          estimatedRefundAmount: refundEstimate.estimatedRefundAmount,
          estimatedCancellationFee: refundEstimate.cancellationFee,
          refundEstimateComputedAt: new Date(),
          refundEstimateNote: refundEstimate.note,
          refundEstimateSnapshot: refundEstimateSnapshot as object,
        },
      }),
      this.prisma.flightBookingStatusHistory.create({
        data: { flightBookingId: booking.id, fromStatus: booking.status, toStatus: newStatus, note: `Cancellation requested (${reason}) — provider: ${statusSummary}` },
      }),
    ]);

    const refundLine =
      refundEstimate.available && refundEstimate.estimatedRefundAmount != null
        ? `Estimated refund: ${booking.currency} ${refundEstimate.estimatedRefundAmount.toLocaleString("en-IN")}.`
        : "Our team will confirm your refund amount and process it shortly.";
    await this.alertCustomer(tenantId, booking.customerId, {
      type: "FLIGHT_BOOKING_CANCELLED",
      title: allCancelled ? "Flight booking cancelled" : "Flight cancellation in progress",
      inAppBody: `Your flight ${booking.depCity} → ${booking.arrCity} on ${booking.onDate} has been ${allCancelled ? "cancelled" : "submitted for cancellation"}. ${refundLine}`,
      emailSubject: allCancelled ? "Your flight booking has been cancelled" : "Your flight cancellation is in progress",
      emailHtml: `<p>Hi,</p><p>Your flight booking from <b>${booking.depCity}</b> to <b>${booking.arrCity}</b> on ${booking.onDate} has been ${allCancelled ? "cancelled" : "submitted for cancellation"}.</p><p>${refundLine}</p>`,
      whatsappBody: `Your Paxbook flight booking (${booking.depCity} → ${booking.arrCity}) has been ${allCancelled ? "cancelled" : "submitted for cancellation"}. ${refundLine}`,
    });

    return this.toDto(await this.prisma.flightBooking.findFirstOrThrow({ where: { id: booking.id }, include: { passengers: true } }));
  }

  /** Read-only preview of the same estimate cancelBooking() will freeze — used by the customer-facing
   * cancel modal so they see a real number (or the honest "can't estimate this" fallback) before
   * committing to an irreversible cancellation. Shares computeEstimate with cancelBooking so the two
   * numbers can never drift apart. */
  async previewCancellationEstimate(tenantId: string, customerId: string, flightBookingId: string): Promise<FlightCancellationEstimateDto> {
    const booking = await this.getOwned(tenantId, customerId, flightBookingId);
    if (!FlightsService.CANCELLABLE_STATUSES.has(booking.status)) {
      throw new BadRequestException({ code: "CANCELLATION_NOT_ALLOWED", message: `A booking with status ${booking.status} cannot be cancelled.` });
    }
    return (await this.computeEstimate(booking)).dto;
  }

  private async computeEstimate(booking: {
    flightId: string | null;
    providerFareAmount: { toNumber(): number } | null;
    currency: string;
    fareSnapshot: unknown;
    passengers: unknown[];
  }): Promise<{ dto: FlightCancellationEstimateDto; snapshot: unknown }> {
    // journey_segment in FTD's Fare Rules is the overall origin-destination pair (e.g. "DEL-BOM"),
    // not each physical flight leg — confirmed against a real connecting itinerary (DEL-HYD-MAA-BOM)
    // whose fare rules only listed "DEL-BOM". Using legs[0]'s own arrCode would silently never match
    // on any connecting flight.
    const legs = extractFlightSnapshot(booking.fareSnapshot).legs;
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    return this.cancellationEstimate.estimate({
      flightId: booking.flightId,
      providerFareAmount: booking.providerFareAmount,
      passengerCount: booking.passengers.length,
      journeyDepCode: firstLeg?.depCode ?? "",
      journeyArrCode: lastLeg?.arrCode ?? "",
      journeyDepDateTime: firstLeg?.depDateTime ?? "",
      currency: booking.currency,
    });
  }

  private static readonly DATE_CHANGE_ELIGIBLE_STATUSES = new Set(["CONFIRMED"]);

  /**
   * Submits a real date-change request to FTD's "Reissue Quotation" endpoint. Per FTD's own spec
   * this only files the request and returns a tracking ID — "No changes are done in this request"
   * and there is no separate confirm/execute endpoint — so the actual fare difference and rebooking
   * happen out-of-band, tracked here via dateChangeReissueId, mirroring how a cancellation's refund
   * also needs admin follow-up for the parts FTD doesn't automate.
   */
  async requestDateChange(tenantId: string, customerId: string, flightBookingId: string, dto: { newTravelDate: string; remarks: string }): Promise<FlightBookingDto> {
    const booking = await this.getOwned(tenantId, customerId, flightBookingId);
    if (!FlightsService.DATE_CHANGE_ELIGIBLE_STATUSES.has(booking.status)) {
      throw new BadRequestException({ code: "DATE_CHANGE_NOT_ALLOWED", message: `A booking with status ${booking.status} is not eligible for a date change request.` });
    }
    if (!booking.refId) {
      throw new BadRequestException({ code: "MISSING_REF_ID", message: "This booking is missing its provider reference and cannot request a date change. Please contact support." });
    }
    const paxIds = booking.passengers.map((p) => p.paxId).filter((id): id is string => Boolean(id));
    if (paxIds.length === 0) {
      throw new BadRequestException({ code: "NO_PROVIDER_PAX_ID", message: "This booking has no provider passenger IDs on file. Please contact support." });
    }
    const { legs } = extractFlightSnapshot(booking.fareSnapshot);
    const firstLeg = legs[0];
    if (!firstLeg) {
      throw new BadRequestException({ code: "MISSING_FLIGHT_DETAILS", message: "Could not determine this booking's flight details. Please contact support." });
    }

    const newTravelDate = dto.newTravelDate.slice(0, 10);
    const [year, month, day] = newTravelDate.split("-");
    const raw = await this.ftd.reschedule({
      refID: booking.refId,
      paxId: paxIds.join(","),
      paxIdr: "",
      travelDate: `${day}-${month}-${year}`,
      flightDetail: `${firstLeg.airlineCode}-${firstLeg.flightNo}`,
      travelDater: "",
      flightDetailr: "",
      reissueRemarks: dto.remarks,
    });
    const mapped = mapRescheduleResponse(raw);

    await this.prisma.$transaction([
      this.prisma.flightBooking.update({
        where: { id: booking.id },
        data: {
          dateChangeRequestedAt: new Date(),
          dateChangeNewDate: newTravelDate,
          dateChangeRemarks: dto.remarks,
          dateChangeReissueId: mapped.reissueId || null,
          dateChangeStatus: mapped.status || "submitted",
        },
      }),
      this.prisma.flightBookingStatusHistory.create({
        data: {
          flightBookingId: booking.id,
          fromStatus: booking.status,
          toStatus: booking.status,
          note: `Date change requested to ${newTravelDate} (reissue ref ${mapped.reissueId || "—"}) — ${dto.remarks}`,
        },
      }),
    ]);

    await this.alertCustomer(tenantId, customerId, {
      type: "FLIGHT_DATE_CHANGE_REQUESTED",
      title: "Date change request submitted",
      inAppBody: `Your request to change your flight (${booking.depCity} → ${booking.arrCity}) to ${newTravelDate} has been submitted. Our team will confirm the fare difference and process it shortly.`,
      emailSubject: "Your date change request has been submitted",
      emailHtml: `<p>Hi,</p><p>We've submitted your request to change your flight from <b>${booking.depCity}</b> to <b>${booking.arrCity}</b> to <b>${newTravelDate}</b>.</p><p>Our team will confirm the fare difference (if any) and get back to you shortly to complete the change.</p><p>Reference: <b>${mapped.reissueId || "—"}</b></p>`,
      whatsappBody: `Your Paxbook date change request (${booking.depCity} → ${booking.arrCity}, new date ${newTravelDate}) has been submitted. We'll confirm shortly.`,
    });

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
    refundAmount: { toNumber(): number } | null; refundedAt: Date | null; refundReference: string | null;
    estimatedRefundAmount: { toNumber(): number } | null; estimatedCancellationFee: { toNumber(): number } | null; refundEstimateComputedAt: Date | null; refundEstimateNote: string | null;
    dateChangeRequestedAt: Date | null; dateChangeNewDate: string | null; dateChangeRemarks: string | null; dateChangeReissueId: string | null; dateChangeStatus: string | null;
    tripId: string | null; tripRole: string | null; createdAt: Date; updatedAt: Date;
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
      estimatedRefundAmount: b.estimatedRefundAmount ? b.estimatedRefundAmount.toNumber() : null,
      estimatedCancellationFee: b.estimatedCancellationFee ? b.estimatedCancellationFee.toNumber() : null,
      refundEstimateComputedAt: b.refundEstimateComputedAt ? b.refundEstimateComputedAt.toISOString() : null,
      refundEstimateNote: b.refundEstimateNote,
      dateChangeRequestedAt: b.dateChangeRequestedAt ? b.dateChangeRequestedAt.toISOString() : null,
      dateChangeNewDate: b.dateChangeNewDate,
      dateChangeRemarks: b.dateChangeRemarks,
      dateChangeReissueId: b.dateChangeReissueId,
      dateChangeStatus: b.dateChangeStatus,
      tripId: b.tripId,
      tripRole: b.tripRole as FlightBookingDto["tripRole"],
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
