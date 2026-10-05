import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { FlightCheckoutService } from "./flight-checkout.service";

const DAY = 24 * 60 * 60 * 1000;

function coupon(overrides: Record<string, unknown> = {}) {
  return {
    id: "c1",
    tenantId: "t1",
    code: "FLY10",
    description: null,
    discountType: "PERCENT",
    value: new Prisma.Decimal(10),
    minBookingAmount: null,
    maxDiscountAmount: null,
    destinationId: null,
    validFrom: new Date(Date.now() - DAY),
    validTo: new Date(Date.now() + DAY),
    usageLimit: null,
    usageCount: 0,
    isActive: true,
    appliesTo: "ALL",
    showOnCheckout: true,
    createdAt: new Date(),
    ...overrides,
  };
}

function serviceWith(row: unknown) {
  const prisma = { coupon: { findFirst: jest.fn().mockResolvedValue(row) } };
  return new FlightCheckoutService(prisma as never);
}

describe("flight coupon quote", () => {
  it("takes a percentage off", async () => {
    const q = await serviceWith(coupon()).quote("t1", "fly10", 3813.6);
    expect(q).toMatchObject({ code: "FLY10", discount: 381.36, payable: 3432.24 });
  });

  it("caps a percentage at the max discount", async () => {
    const q = await serviceWith(coupon({ maxDiscountAmount: new Prisma.Decimal(200) })).quote("t1", "FLY10", 5000);
    expect(q.discount).toBe(200);
  });

  it("never discounts more than the amount", async () => {
    const q = await serviceWith(coupon({ discountType: "FIXED", value: new Prisma.Decimal(900) })).quote("t1", "FLY10", 500);
    expect(q).toMatchObject({ discount: 500, payable: 0 });
  });

  it.each([
    ["unknown code", null],
    ["inactive", coupon({ isActive: false })],
    ["packages only", coupon({ appliesTo: "PACKAGES" })],
    ["tied to a destination", coupon({ destinationId: "d1" })],
    ["expired", coupon({ validTo: new Date(Date.now() - DAY) })],
    ["not started", coupon({ validFrom: new Date(Date.now() + DAY) })],
    ["used up", coupon({ usageLimit: 5, usageCount: 5 })],
    ["below minimum", coupon({ minBookingAmount: new Prisma.Decimal(10000) })],
  ])("rejects a coupon that is %s", async (_label, row) => {
    await expect(serviceWith(row).quote("t1", "FLY10", 3000)).rejects.toBeInstanceOf(BadRequestException);
  });
});
