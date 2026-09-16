import { BadRequestException, NotFoundException } from "@nestjs/common";
import { FlightsService } from "./flights.service";

/**
 * Focused on requestDateChange()'s guard clauses — the newest, most-changed logic in this file
 * this session (including the DATE_CHANGE_ALREADY_PENDING guard added to stop a second request
 * from silently overwriting the first's structured columns). Each guard throws before ever
 * touching FtdClientService, so a bare mocked PrismaService is enough here; the guards being
 * pure precondition checks on the loaded booking row make them cheap to lock in without needing
 * a live FTD call or a full Nest TestingModule.
 */
describe("FlightsService.requestDateChange", () => {
  function makeService(bookingOverrides: Record<string, unknown>) {
    const booking = {
      id: "booking-1",
      status: "CONFIRMED",
      refId: "FTD123",
      dateChangeRequestedAt: null,
      fareSnapshot: { option: { legs: [{ airlineCode: "AI", flightNo: "101" }] } },
      passengers: [{ paxId: "999" }],
      ...bookingOverrides,
    };
    const prisma = { flightBooking: { findFirst: jest.fn().mockResolvedValue(booking) } };
    const ftd = { reschedule: jest.fn() };
    // Constructor deps beyond prisma/ftd are never reached by a guard-clause rejection.
    const service = new FlightsService(prisma as any, ftd as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    return { service, prisma, ftd };
  }

  const dto = { newTravelDate: "2026-10-02", remarks: "Change of plans" };

  it("rejects a booking that isn't CONFIRMED", async () => {
    const { service } = makeService({ status: "PENDING_CONFIRMATION" });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toMatchObject({
      response: { code: "DATE_CHANGE_NOT_ALLOWED" },
    });
  });

  it("rejects a second request while one is already pending, without calling FTD", async () => {
    const { service, ftd } = makeService({ dateChangeRequestedAt: new Date("2026-09-16T00:00:00Z") });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toMatchObject({
      response: { code: "DATE_CHANGE_ALREADY_PENDING" },
    });
    expect(ftd.reschedule).not.toHaveBeenCalled();
  });

  it("rejects a booking with no provider reference", async () => {
    const { service } = makeService({ refId: null });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toMatchObject({
      response: { code: "MISSING_REF_ID" },
    });
  });

  it("rejects a booking whose passengers have no provider pax IDs on file", async () => {
    const { service } = makeService({ passengers: [{ paxId: null }] });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toMatchObject({
      response: { code: "NO_PROVIDER_PAX_ID" },
    });
  });

  it("rejects a booking whose fareSnapshot has no flight legs", async () => {
    const { service } = makeService({ fareSnapshot: { option: { legs: [] } } });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toMatchObject({
      response: { code: "MISSING_FLIGHT_DETAILS" },
    });
  });

  it("throws NotFoundException, not a guard error, when the booking doesn't belong to this customer", async () => {
    const prisma = { flightBooking: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new FlightsService(prisma as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("all guard rejections are BadRequestException (400), not a raw error", async () => {
    const { service } = makeService({ status: "CANCELLED" });
    await expect(service.requestDateChange("tenant-1", "cust-1", "booking-1", dto)).rejects.toBeInstanceOf(BadRequestException);
  });
});
