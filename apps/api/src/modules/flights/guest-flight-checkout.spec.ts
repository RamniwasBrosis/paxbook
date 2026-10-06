import { NotFoundException } from "@nestjs/common";
import { GuestFlightCheckoutService } from "./guest-flight-checkout.service";

const config = { getOrThrow: () => "test-secret" };

function setup(existingCustomer: { id: string } | null = null) {
  const prisma = {
    customer: {
      findFirst: jest.fn().mockResolvedValueOnce(existingCustomer).mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "new-cust" }),
    },
    flightBooking: { findFirst: jest.fn().mockResolvedValue({ customerId: "cust-1" }) },
  };
  const flights = {
    createDraftBooking: jest.fn().mockResolvedValue({ id: "bk-1" }),
    createRoundTripDraftBooking: jest.fn().mockResolvedValue({ tripId: "trip-1" }),
  };
  return { prisma, flights, svc: new GuestFlightCheckoutService(prisma as never, config as never, flights as never) };
}

const dto = { email: "Guest@Example.com", mobile: "+91 98765 43210", passengers: [{ fName: "Asha", lName: "Rao" }], searchContext: {} } as never;

describe("guest flight checkout", () => {
  it("files the booking under the existing customer for that email, without a session", async () => {
    const { svc, flights, prisma } = setup({ id: "cust-1" });
    const res = await svc.createBooking("t1", dto);
    expect(flights.createDraftBooking).toHaveBeenCalledWith("t1", "cust-1", dto, {});
    expect(prisma.customer.create).not.toHaveBeenCalled();
    expect(Object.keys(res).sort()).toEqual(["booking", "guestToken"]);
  });

  it("creates a password-less customer for a new email", async () => {
    const { svc, prisma } = setup(null);
    await svc.createBooking("t1", dto);
    expect(prisma.customer.create).toHaveBeenCalledWith({ data: { tenantId: "t1", name: "Asha Rao", email: "guest@example.com", phone: "9876543210" }, select: { id: true } });
  });

  it("accepts only the token issued for that booking", async () => {
    const { svc } = setup({ id: "cust-1" });
    const { guestToken } = await svc.createBooking("t1", dto);
    await expect(svc.bookingCustomer("t1", "bk-1", guestToken)).resolves.toBe("cust-1");
    await expect(svc.bookingCustomer("t1", "bk-2", guestToken)).rejects.toBeInstanceOf(NotFoundException);
    await expect(svc.bookingCustomer("t1", "bk-1", undefined)).rejects.toBeInstanceOf(NotFoundException);
    await expect(svc.bookingCustomer("t1", "bk-1", guestToken.slice(0, -2) + "xx")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("does not let a booking token open a trip", async () => {
    const { svc } = setup({ id: "cust-1" });
    const { guestToken } = await svc.createBooking("t1", dto);
    await expect(svc.tripCustomer("t1", "bk-1", guestToken)).rejects.toBeInstanceOf(NotFoundException);
  });
});
