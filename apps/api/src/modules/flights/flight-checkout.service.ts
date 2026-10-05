import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, type Coupon } from "@prisma/client";
import type { CouponQuoteDto, FlightImportantInfoSectionDto, PublicCouponDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";

/** Shown until the admin saves their own "Important information" for the flight booking page. */
export const DEFAULT_FLIGHT_IMPORTANT_INFO: FlightImportantInfoSectionDto[] = [
  {
    title: "Check travel guidelines and baggage information",
    points: [
      "Carry no more than 1 check-in bag and 1 hand bag per passenger unless your fare includes more. The airline may charge for extra or overweight bags.",
      "Check-in counters usually close 45–60 minutes before departure for domestic flights. Late arrivals may be denied boarding.",
    ],
  },
  {
    title: "Valid ID proof",
    points: [
      "Carry a valid government photo ID such as Aadhaar, passport, driving licence or voter ID.",
      "For international travel your passport should be valid for at least 6 months from the date of travel.",
    ],
  },
  {
    title: "Boarding pass",
    points: ["Complete web check-in on the airline's website or app. Your boarding pass is available once web check-in is done."],
  },
  {
    title: "Unaccompanied minors travelling",
    points: [
      "A child travelling without an adult aged 18 or older needs the airline's unaccompanied-minor service.",
      "Rules differ between airlines, so please check with the airline before booking.",
    ],
  },
];

/**
 * Flight checkout extras: admin-managed coupons (Offers with appliesTo ALL/FLIGHTS) and the
 * admin-managed "Important information" block. Coupon amounts are always computed here, never
 * taken from the client.
 */
@Injectable()
export class FlightCheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getImportantInfo(tenantId: string): Promise<FlightImportantInfoSectionDto[]> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { flightImportantInfo: true } });
    const saved = parseSections(tenant?.flightImportantInfo);
    return saved ?? DEFAULT_FLIGHT_IMPORTANT_INFO;
  }

  /** `sections` null resets to the built-in defaults. */
  async saveImportantInfo(tenantId: string, sections: FlightImportantInfoSectionDto[] | null): Promise<FlightImportantInfoSectionDto[]> {
    const clean = sections
      ? sections
          .map((s) => ({ title: s.title.trim(), points: s.points.map((p) => p.trim()).filter(Boolean) }))
          .filter((s) => s.title || s.points.length)
      : null;
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { flightImportantInfo: clean === null ? Prisma.DbNull : (clean as unknown as Prisma.InputJsonValue) },
    });
    return clean ?? DEFAULT_FLIGHT_IMPORTANT_INFO;
  }

  async listCoupons(tenantId: string): Promise<PublicCouponDto[]> {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        tenantId,
        isActive: true,
        showOnCheckout: true,
        appliesTo: { in: ["ALL", "FLIGHTS"] },
        destinationId: null,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });
    return coupons
      .filter((c) => c.usageLimit === null || c.usageCount < c.usageLimit)
      .map((c) => ({
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        value: c.value.toNumber(),
        minBookingAmount: c.minBookingAmount?.toNumber() ?? null,
        maxDiscountAmount: c.maxDiscountAmount?.toNumber() ?? null,
        validTo: c.validTo.toISOString(),
      }));
  }

  /** Throws a customer-readable 400 when the code can't be used on this amount. */
  async quote(tenantId: string, rawCode: string, amount: number): Promise<CouponQuoteDto> {
    const code = rawCode.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findFirst({ where: { tenantId, code: { equals: code, mode: "insensitive" } } });
    const discount = this.discountFor(coupon, amount);
    return { code: coupon!.code, discount, payable: round2(amount - discount), description: coupon!.description };
  }

  async incrementUsage(tenantId: string, code: string | null | undefined): Promise<void> {
    if (!code) return;
    await this.prisma.coupon.updateMany({ where: { tenantId, code: { equals: code, mode: "insensitive" } }, data: { usageCount: { increment: 1 } } });
  }

  private discountFor(coupon: Coupon | null, amount: number): number {
    const reject = (message: string) => new BadRequestException({ code: "COUPON_INVALID", message });
    const now = new Date();
    if (!coupon || !coupon.isActive || coupon.destinationId || !["ALL", "FLIGHTS"].includes(coupon.appliesTo)) {
      throw reject("This coupon code is not valid for flights.");
    }
    if (coupon.validFrom > now) throw reject("This coupon is not active yet.");
    if (coupon.validTo < now) throw reject("This coupon has expired.");
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) throw reject("This coupon has reached its usage limit.");
    const min = coupon.minBookingAmount?.toNumber() ?? 0;
    if (amount < min) throw reject(`This coupon needs a booking of at least ₹${min.toLocaleString("en-IN")}.`);

    let discount = coupon.discountType === "PERCENT" ? (amount * coupon.value.toNumber()) / 100 : coupon.value.toNumber();
    const cap = coupon.maxDiscountAmount?.toNumber();
    if (cap !== undefined && cap > 0) discount = Math.min(discount, cap);
    return round2(Math.max(0, Math.min(discount, amount)));
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseSections(value: unknown): FlightImportantInfoSectionDto[] | null {
  if (!Array.isArray(value)) return null;
  const sections = value
    .filter((s): s is { title: unknown; points: unknown } => typeof s === "object" && s !== null)
    .map((s) => ({
      title: typeof s.title === "string" ? s.title : "",
      points: Array.isArray(s.points) ? s.points.filter((p): p is string => typeof p === "string") : [],
    }));
  return sections;
}
