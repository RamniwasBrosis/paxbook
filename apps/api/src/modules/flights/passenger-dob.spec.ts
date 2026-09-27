import { BadRequestException } from "@nestjs/common";
import { DEFAULT_ADULT_DOB, dobIsOptional, resolvePassengerDobs } from "./flights.service";

const domesticRegular = { serType: 1, fareType: "A" };

describe("passenger DOB rules", () => {
  it("fills the default only for an adult on a domestic Regular fare", () => {
    const [p] = resolvePassengerDobs([{ pType: "A", dob: "" }], domesticRegular);
    expect(p!.dob).toBe(DEFAULT_ADULT_DOB);
  });

  it("keeps a DOB the traveller entered", () => {
    const [p] = resolvePassengerDobs([{ pType: "A", dob: "15-05-1990" }], domesticRegular);
    expect(p!.dob).toBe("15-05-1990");
  });

  it.each([
    ["child on domestic", { pType: "C" }, domesticRegular],
    ["infant on domestic", { pType: "I" }, domesticRegular],
    ["adult on international", { pType: "A" }, { serType: 2, fareType: "A" }],
    ["adult on Senior Citizen fare", { pType: "A" }, { serType: 1, fareType: "C" }],
    ["adult on Student fare", { pType: "A" }, { serType: 1, fareType: "S" }],
    ["adult on Defence fare", { pType: "A" }, { serType: 1, fareType: "D" }],
  ])("still requires a DOB for %s", (_label, pax, ctx) => {
    expect(() => resolvePassengerDobs([{ ...pax, dob: "" }], ctx)).toThrow(BadRequestException);
    expect(dobIsOptional(pax.pType, ctx)).toBe(false);
  });
});
