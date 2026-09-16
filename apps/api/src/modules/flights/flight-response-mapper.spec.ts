import {
  extractFlightSnapshot,
  mapCancelResponse,
  mapFareRules,
  mapPriceCheck,
  mapRescheduleResponse,
  mapSearchOrFareDetails,
  mapSeats,
  mapStatementResponse,
} from "./flight-response-mapper";

describe("mapRescheduleResponse", () => {
  // The vendor's own spec sample implies a flat { reissueID, status } shape, but the real live
  // response nests both under Status — this bug shipped once already (found via a live E2E run
  // that returned reissueId: null) before the mapper was fixed to check both shapes.
  it("reads reissueID/status from the real nested Status shape", () => {
    const real = { Status: { status: "success", reissueID: "SZR2609158374032" } };
    expect(mapRescheduleResponse(real)).toEqual({ reissueId: "SZR2609158374032", status: "success" });
  });

  it("falls back to a flat shape if FTD ever sends one", () => {
    const flat = { reissueID: "SZR123", status: "success" };
    expect(mapRescheduleResponse(flat)).toEqual({ reissueId: "SZR123", status: "success" });
  });

  it("falls back to lowercase status/reissueId keys", () => {
    const lower = { status: { reissueId: "SZR999", status: "pending" } };
    expect(mapRescheduleResponse(lower)).toEqual({ reissueId: "SZR999", status: "pending" });
  });

  it("returns empty strings, not throwing, on a totally empty response", () => {
    expect(mapRescheduleResponse({})).toEqual({ reissueId: "", status: "" });
  });
});

describe("mapCancelResponse", () => {
  it("reads the real Book-response casing (capitalized Ticket/Status, lowercase Cancelstatus)", () => {
    const real = {
      Status: { refID: "FTD123", status: "success" },
      ticket: {
        Onward: { Passenger: [{ paxID: "1", Cancelstatus: "Cancelled" }] },
        Return: { Passenger: [{ paxID: "2", Cancelstatus: "Cancelled" }] },
      },
    };
    expect(mapCancelResponse(real)).toEqual({
      refId: "FTD123",
      status: "success",
      passengers: [
        { paxId: "1", cancelStatus: "Cancelled" },
        { paxId: "2", cancelStatus: "Cancelled" },
      ],
    });
  });

  it("also reads the alternate lowercase-Ticket / lowercase-status variant defensively", () => {
    const alt = {
      status: { refID: "FTD456", status: "success" },
      Ticket: { onward: { passenger: [{ paxId: "3", cancelstatus: "Cancelled" }] } },
    };
    expect(mapCancelResponse(alt)).toEqual({ refId: "FTD456", status: "success", passengers: [{ paxId: "3", cancelStatus: "Cancelled" }] });
  });

  it("returns an empty passenger list rather than throwing when a leg is entirely absent (one-way cancel)", () => {
    const oneWayOnly = { Status: { refID: "FTD789", status: "success" }, ticket: { Onward: { Passenger: [{ paxID: "1", Cancelstatus: "Cancelled" }] } } };
    expect(mapCancelResponse(oneWayOnly).passengers).toEqual([{ paxId: "1", cancelStatus: "Cancelled" }]);
  });
});

describe("mapStatementResponse", () => {
  it("reads the real flat { data: [...] } shape (matched the vendor's documented sample first try)", () => {
    const real = {
      data: [
        {
          s_no: 1,
          value_date: "2026-09-16",
          transaction_type: "Booking",
          transaction_ref: "FTD2OVNL9FN537K",
          debit: 3081,
          credit: 0,
          commission: 50,
          booking_balance: 9825933,
          remarks: "DEL-BOM booking",
        },
      ],
    };
    const entries = mapStatementResponse(real);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ sNo: 1, valueDate: "2026-09-16", transactionType: "Booking", debit: 3081, credit: 0, commission: 50, bookingBalance: 9825933 });
  });

  it("falls back to a capitalized Data key defensively", () => {
    const capitalized = { Data: [{ s_no: 2, transaction_type: "Refund" }] };
    expect(mapStatementResponse(capitalized)).toHaveLength(1);
  });

  it("falls back to a capitalized Commission field", () => {
    const capitalizedCommission = { data: [{ Commission: 75 }] };
    expect(mapStatementResponse(capitalizedCommission)[0]!.commission).toBe(75);
  });

  it("returns an empty array, not throwing, when there are no transactions on a date", () => {
    expect(mapStatementResponse({ data: [] })).toEqual([]);
  });
});

describe("mapFareRules", () => {
  it("prefers the html shape when html is present at the top level, ignoring any structured policy", () => {
    const raw = { html: "<p>Cancellation rules...</p>", farerule: { genRemarks: "LNU applies" }, policy: { cancellation: [{}] } };
    expect(mapFareRules(raw)).toEqual({ kind: "html", genRemarks: "LNU applies", html: "<p>Cancellation rules...</p>" });
  });

  it("also finds html nested inside farerule.html", () => {
    const raw = { farerule: { html: "<p>Nested html</p>" } };
    expect(mapFareRules(raw)).toEqual({ kind: "html", genRemarks: null, html: "<p>Nested html</p>" });
  });

  it("falls back to the structured policy shape when no html is present anywhere", () => {
    const raw = {
      farerule: { genRemarks: "Standard fare rules" },
      policy: {
        cancellation: [{ journey_segment: "DEL-BOM", start: 0, end: 24, start_type: 1, end_type: 0, amount: 500, amount_type: 1, remarks: "Within 24h" }],
        reissue: [],
        noshow: [],
        seat: [],
      },
    };
    const mapped = mapFareRules(raw);
    expect(mapped.kind).toBe("structured");
    if (mapped.kind === "structured") {
      expect(mapped.cancellation).toEqual([{ journeySegment: "DEL-BOM", start: 0, end: 24, startType: 1, endType: 0, amount: 500, amountType: 1, remarks: "Within 24h" }]);
    }
  });

  it("reads farerule under any of the three casings the provider is known to use", () => {
    expect(mapFareRules({ FareRule: { html: "<p>x</p>" } }).kind).toBe("html");
    expect(mapFareRules({ farRule: { html: "<p>x</p>" } }).kind).toBe("html");
  });
});

describe("mapSearchOrFareDetails", () => {
  it("maps a real one-way search result with numeric-keyed legs and a flat Fare shape", () => {
    const real = {
      Status: { refID: "FTD2Q26QB28JOG0", is_complete: true },
      results: [
        {
          Flights: {
            Onward: {
              "0": { flightID: 390805, depCode: "DEL", depCName: "New Delhi", depDate: "202609260200", arrCode: "BOM", arrCName: "Mumbai", arrDate: "202609260425", flightNo: "5509", airCode: "AI", airName: "Air India", duration: 145 },
              durTotal: 145,
              stops: 0,
            },
          },
          Fare: { bagCkin: "1 Pc||", bagCbin: "7 Kg||", seats: "17", refundType: "P", fareTypeInd: 2, total: { base: 3526, tax: 215, total: 3741, netfare: 2941, inc: 800, tds: 16, agentMarkup: 0 } },
          Validation: { lcc: "0", freeMeal: "1", gstInd: "2", allowFQT: "0" },
        },
      ],
    };
    const mapped = mapSearchOrFareDetails(real);
    expect(mapped.refId).toBe("FTD2Q26QB28JOG0");
    expect(mapped.isComplete).toBe(true);
    expect(mapped.options).toHaveLength(1);
    expect(mapped.options[0]!.id).toBe("390805");
    expect(mapped.options[0]!.legs[0]).toMatchObject({ depCode: "DEL", arrCode: "BOM", depDateTime: "2026-09-26T02:00:00", airlineCode: "AI" });
    expect(mapped.options[0]!.fare).toMatchObject({ total: 3741, refundable: true, fareTypeLabel: "Retail Fare" });
    expect(mapped.options[0]!.validation).toMatchObject({ freeMeal: true, isLowCostCarrier: false });
  });

  it("does not crash and returns isComplete true when Status is entirely missing", () => {
    expect(mapSearchOrFareDetails({ results: [] })).toEqual({ refId: "", isComplete: true, options: [] });
  });
});

describe("mapPriceCheck", () => {
  it("maps real SSR baggage/meal options and web check-in fields", () => {
    const real = {
      result: {
        Flights: { Onward: { "0": { flightID: 263906, depCode: "DEL", arrCode: "BOM" }, durTotal: 100, stops: 0 } },
        Fare: { Onward: { bagCkin: "20 Kg||", bagCbin: "7 Kg||", seats: "20" }, refundType: "N", fareTypeInd: 0, total: { base: 2482, tax: 599, total: 3081 } },
        Validation: {},
        ssrInfo: {
          Onward: { Bagg: [{ baggID: "B1FTD", baggAmt: "1500", baggDesc: "Extra Baggage 3Kg", paxType: "All" }], Meal: [{ mealID: "M1FTD", mealAmt: "250", mealDesc: "Tiramisu", mealRef: "1", paxType: "All" }] },
          web_checkin_enabled: 1,
          web_checkin_amount: "79",
        },
      },
    };
    const mapped = mapPriceCheck(real);
    expect(mapped.option.fare.total).toBe(3081);
    expect(mapped.ssr?.onward.baggage).toEqual([{ id: "B1FTD", amount: 1500, description: "Extra Baggage 3Kg", paxType: "All" }]);
    expect(mapped.ssr?.onward.meals).toEqual([{ id: "M1FTD", amount: 250, description: "Tiramisu", legRef: 1, paxType: "All" }]);
    expect(mapped.ssr?.webCheckinEnabled).toBe(true);
    expect(mapped.ssr?.webCheckinAmount).toBe(79);
  });

  it("returns ssr: null when ssrInfo is absent rather than a half-populated object", () => {
    const noSsr = { result: { Flights: { Onward: { "0": {}, durTotal: 0, stops: 0 } }, Fare: {}, Validation: {} } };
    expect(mapPriceCheck(noSsr).ssr).toBeNull();
  });
});

describe("mapSeats", () => {
  it("reads FTD's inverted isBooked flag literally (true = available) without 'fixing' it", () => {
    const raw = { result: { FlightSeat: { Onward: [{ SeatMap: [{ row: 1, col: "A", seatID: "1A", isBooked: true, isAisle: false, seatAmt: "500" }] }] } } };
    expect(mapSeats(raw).onward[0]!.seatMap[0]).toMatchObject({ seatID: "1A", isBooked: true, seatAmt: 500 });
  });

  it("also reads the flat (no 'result' wrapper) shape defensively", () => {
    const flat = { FlightSeat: { Onward: [{ SeatMap: [{ row: 2, col: "B", seatID: "2B", isBooked: "0" }] }] } };
    expect(mapSeats(flat).onward[0]!.seatMap[0]).toMatchObject({ seatID: "2B", isBooked: false });
  });
});

describe("extractFlightSnapshot", () => {
  it("pulls legs/fare back out of a real frozen fareSnapshot", () => {
    const snapshot = { option: { legs: [{ depCode: "DEL" }], fare: { total: 3081 } } };
    expect(extractFlightSnapshot(snapshot)).toEqual({ legs: [{ depCode: "DEL" }], returnLegs: null, fare: { total: 3081 } });
  });

  it("degrades gracefully instead of throwing on a malformed/older snapshot missing 'option'", () => {
    expect(extractFlightSnapshot({ somethingElse: true })).toEqual({ legs: [], returnLegs: null, fare: null });
    expect(extractFlightSnapshot(null)).toEqual({ legs: [], returnLegs: null, fare: null });
    expect(extractFlightSnapshot(undefined)).toEqual({ legs: [], returnLegs: null, fare: null });
  });
});
