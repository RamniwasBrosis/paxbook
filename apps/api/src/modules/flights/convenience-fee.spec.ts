import { FlightPricingService } from "./flight-pricing.service";

const svc = new FlightPricingService({} as never);
const on = { convenienceFeeEnabled: true, convenienceFeeGstPercent: 18 };

describe("convenience fee (GST on final margin)", () => {
  it("is 18% of the margin when no coupon", () => {
    // provider 5000, customer fare 5750 (15% margin) → fee 18% of 750
    expect(svc.convenienceFee(on, 750, 0)).toBe(135);
  });
  it("is charged on the margin left after the coupon", () => {
    expect(svc.convenienceFee(on, 750, 250)).toBe(90);
  });
  it("is zero when the coupon uses up the margin", () => {
    expect(svc.convenienceFee(on, 300, 500)).toBe(0);
  });
  it("is zero when switched off", () => {
    expect(svc.convenienceFee({ ...on, convenienceFeeEnabled: false }, 750, 0)).toBe(0);
  });
  it("rounds to paise", () => {
    expect(svc.convenienceFee(on, 123.45, 0)).toBe(22.22);
  });
});
