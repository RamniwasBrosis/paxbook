import type {
  FlightBaggageOptionDto,
  FlightFareDto,
  FlightLegDto,
  FlightMealOptionDto,
  FlightOptionDto,
  FlightPriceCheckDto,
  FlightSearchResultDto,
  FlightSsrDto,
  FlightValidationDto,
} from "@paxbook/types";

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** "202609260200" (YYYYMMDDHHMM) -> ISO 8601. Falls back to the raw string if it doesn't parse. */
function parseFtdDateTime(raw: string | null | undefined): string {
  if (!raw || raw.length < 12) return raw ?? "";
  const y = raw.slice(0, 4);
  const mo = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const h = raw.slice(8, 10);
  const mi = raw.slice(10, 12);
  const iso = `${y}-${mo}-${d}T${h}:${mi}:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? raw : iso;
}

function toNum(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

function toBool01(v: unknown): boolean {
  return String(v) === "1";
}

/** Legs are keyed "0", "1", "2"... alongside sibling "durTotal"/"stops" — pull out only the numeric-keyed entries, in order. */
function extractLegs(legGroup: Raw | undefined): { legs: FlightLegDto[]; durationTotalMinutes: number; stops: number } {
  if (!legGroup) return { legs: [], durationTotalMinutes: 0, stops: 0 };
  const legKeys = Object.keys(legGroup)
    .filter((k) => /^\d+$/.test(k))
    .sort((a, b) => Number(a) - Number(b));

  const legs: FlightLegDto[] = legKeys.map((key) => {
    const leg = legGroup[key] as Raw;
    return {
      flightId: leg.flightID ? String(leg.flightID) : null,
      depCode: leg.depCode ?? "",
      depCityName: leg.depCName ?? "",
      depAirportName: leg.depAName ?? "",
      depTerminal: leg.depTer || null,
      depDateTime: parseFtdDateTime(leg.depDate),
      flightNo: leg.flightNo ?? "",
      airlineCode: leg.airCode ?? "",
      airlineName: leg.airName ?? "",
      operatingAirlineCode: leg.airCodeOp ?? leg.airCode ?? "",
      operatingAirlineName: leg.airNameOp ?? leg.airName ?? "",
      arrCode: leg.arrCode ?? "",
      arrCityName: leg.arrCName ?? "",
      arrAirportName: leg.arrAName ?? "",
      arrTerminal: leg.arrTer || null,
      arrDateTime: parseFtdDateTime(leg.arrDate),
      cabin: leg.cabin ?? "",
      fareClass: leg.fareClass ?? "",
      durationMinutes: toNum(leg.duration),
      layoverAirport: leg.layover || null,
      aircraftType: leg.airType || null,
    };
  });

  return { legs, durationTotalMinutes: toNum(legGroup.durTotal), stops: toNum(legGroup.stops) };
}

const FARE_TYPE_LABELS: Record<number, string> = {
  1: "Instant Offer",
  2: "Retail Fare",
  3: "SME Fare",
  4: "Flexi Fare",
  5: "Corporate Fare",
  6: "Business Class",
  7: "Premium Economy",
  8: "Special Fare",
  9: "Super Fare",
};

/** Search / Fare Details shape: Fare.{bagCkin,bagCbin,seats,refundType,fareTypeInd,fareTypeDesc,total{...}} — flat, no "Onward" nesting inside Fare. */
function mapFareFlat(fareNode: Raw): FlightFareDto {
  const total = fareNode.total ?? {};
  return {
    baggageCheckIn: fareNode.bagCkin ?? "",
    baggageCabin: fareNode.bagCbin ?? "",
    seatsAvailable: fareNode.seats ?? "",
    refundable: fareNode.refundType === "P",
    fareTypeIndex: toNum(fareNode.fareTypeInd),
    fareTypeLabel: fareNode.fareTypeDesc || FARE_TYPE_LABELS[toNum(fareNode.fareTypeInd)] || "Fare",
    popupMessage: fareNode.popMsg || null,
    base: toNum(total.base),
    tax: toNum(total.tax),
    total: toNum(total.total),
    netFare: toNum(total.netfare),
    incentive: toNum(total.inc),
    tds: toNum(total.tds),
    agentMarkup: toNum(total.agentMarkup),
  };
}

/** Price Check / Book shape: Fare.{Onward:{bagCkin,bagCbin,seats}, total{...}, refundType, fareTypeInd, fareTypeDesc} — sibling nesting. */
function mapFareNested(fareNode: Raw, legNode: Raw | undefined): FlightFareDto {
  const total = fareNode.total ?? {};
  return {
    baggageCheckIn: legNode?.bagCkin ?? "",
    baggageCabin: legNode?.bagCbin ?? "",
    seatsAvailable: legNode?.seats ?? "",
    refundable: fareNode.refundType === "P",
    fareTypeIndex: toNum(fareNode.fareTypeInd),
    fareTypeLabel: fareNode.fareTypeDesc || FARE_TYPE_LABELS[toNum(fareNode.fareTypeInd)] || "Fare",
    popupMessage: fareNode.popMsg || null,
    base: toNum(total.base),
    tax: toNum(total.tax),
    total: toNum(total.total),
    netFare: toNum(total.netfare),
    incentive: toNum(total.inc),
    tds: toNum(total.tds),
    agentMarkup: toNum(total.agentMarkup),
  };
}

function mapValidation(v: Raw | undefined): FlightValidationDto {
  if (!v) return { isLowCostCarrier: false, freeMeal: false, gstIndicator: 0, allowFrequentFlyer: false };
  return {
    isLowCostCarrier: toBool01(v.lcc),
    freeMeal: toBool01(v.freeMeal),
    gstIndicator: toNum(v.gstInd),
    allowFrequentFlyer: toBool01(v.allowFQT),
    suggestedFirstName: v.fName,
    suggestedLastName: v.lName,
    remarks: v.remarks ?? null,
    docMandatory: v.doc_mandatory !== undefined ? toBool01(v.doc_mandatory) : undefined,
    baggageMandatory: v.baggage_mandatory !== undefined ? toBool01(v.baggage_mandatory) : undefined,
    mealMandatory: v.meal_mandatory !== undefined ? toBool01(v.meal_mandatory) : undefined,
    seatMandatory: v.seat_mandatory !== undefined ? toBool01(v.seat_mandatory) : undefined,
    panMandatory: v.pan_mandatory !== undefined ? Boolean(v.pan_mandatory) : undefined,
    documentType: v.document_type || undefined,
  };
}

/** Shared by Search and Fare Details — both return `{ results: [...], Status: { refID, is_complete? } }`. */
export function mapSearchOrFareDetails(raw: Raw): FlightSearchResultDto {
  const results: Raw[] = raw.results ?? [];
  const options: FlightOptionDto[] = results.map((r) => {
    const onward = extractLegs(r.Flights?.Onward);
    const returnLeg = r.Flights?.Return ? extractLegs(r.Flights.Return) : null;
    const firstLegId = r.Flights?.Onward?.["0"]?.flightID;
    return {
      id: firstLegId ? String(firstLegId) : "",
      legs: onward.legs,
      durationTotalMinutes: onward.durationTotalMinutes,
      stops: onward.stops,
      fare: mapFareFlat(r.Fare ?? {}),
      validation: mapValidation(r.Validation),
      ...(returnLeg
        ? {
            returnLegs: returnLeg.legs,
            returnDurationTotalMinutes: returnLeg.durationTotalMinutes,
            returnStops: returnLeg.stops,
            returnFare: r.Fare?.Return ? mapFareFlat(r.Fare.Return) : undefined,
          }
        : {}),
    };
  });

  return { refId: raw.Status?.refID ?? "", isComplete: raw.Status?.is_complete !== false, options };
}

export function mapPriceCheck(raw: Raw): FlightPriceCheckDto {
  const result = raw.result ?? {};
  const onward = extractLegs(result.Flights?.Onward);
  const returnLeg = result.Flights?.Return ? extractLegs(result.Flights.Return) : null;
  const firstLegId = result.Flights?.Onward?.["0"]?.flightID;

  const option: FlightOptionDto = {
    id: firstLegId ? String(firstLegId) : "",
    legs: onward.legs,
    durationTotalMinutes: onward.durationTotalMinutes,
    stops: onward.stops,
    fare: mapFareNested(result.Fare ?? {}, result.Fare?.Onward),
    validation: mapValidation(result.Validation),
    ...(returnLeg
      ? {
          returnLegs: returnLeg.legs,
          returnDurationTotalMinutes: returnLeg.durationTotalMinutes,
          returnStops: returnLeg.stops,
          returnFare: result.Fare?.Return ? mapFareNested(result.Fare.Return, result.Fare.Return) : undefined,
        }
      : {}),
  };

  const ssrRaw = result.ssrInfo;
  const mapBagg = (arr: Raw[] | undefined): FlightBaggageOptionDto[] =>
    (arr ?? []).map((b) => ({ id: b.baggID, amount: toNum(b.baggAmt), description: b.baggDesc, paxType: b.paxType === "Adult" ? "Adult" : b.paxType === "Child" ? "Child" : "All" }));
  const mapMeal = (arr: Raw[] | undefined): FlightMealOptionDto[] =>
    (arr ?? []).map((m) => ({ id: m.mealID, amount: toNum(m.mealAmt), description: m.mealDesc, legRef: toNum(m.mealRef), paxType: m.paxType === "Adult" ? "Adult" : m.paxType === "Child" ? "Child" : "All" }));

  const ssr: FlightSsrDto | null = ssrRaw
    ? {
        onward: { baggage: mapBagg(ssrRaw.Onward?.Bagg), meals: mapMeal(ssrRaw.Onward?.Meal) },
        ...(ssrRaw.Return ? { return: { baggage: mapBagg(ssrRaw.Return.Bagg), meals: mapMeal(ssrRaw.Return.Meal) } } : {}),
        webCheckinEnabled: toBool01(ssrRaw.web_checkin_enabled) || ssrRaw.web_checkin_enabled === 1,
        webCheckinAmount: toNum(ssrRaw.web_checkin_amount),
      }
    : null;

  return { option, ssr };
}

export interface MappedBookingLeg {
  passengers: Array<{
    paxId: string;
    title: string;
    fName: string;
    lName: string;
    pType: string;
    gender: string;
    dob: string;
    pnr: string;
    ticketNo: string;
    barcodeText1: string | null;
    barcodeText2: string | null;
    barcodeText3: string | null;
  }>;
}

export interface MappedBookingResponse {
  success: boolean;
  errorDesc: string;
  onward: MappedBookingLeg | null;
  return: MappedBookingLeg | null;
  refId: string;
  clientId: string;
  status: string;
}

function mapBookingLeg(leg: Raw | undefined): MappedBookingLeg | null {
  if (!leg?.passenger) return null;
  return {
    passengers: (leg.passenger as Raw[]).map((p) => ({
      paxId: String(p.paxID ?? ""),
      title: p.title ?? "",
      fName: p.fName ?? "",
      lName: p.lName ?? "",
      pType: p.pType ?? "",
      gender: p.gender ?? "",
      dob: p.dob ?? "",
      pnr: p.pnr ?? "",
      ticketNo: p.ticketNo ?? "",
      barcodeText1: p.barcodeText1 ?? null,
      barcodeText2: p.barcodeText2 ?? null,
      barcodeText3: p.barcodeText3 ?? null,
    })),
  };
}

/** Shared by Book and Booking Status — same envelope shape. */
export function mapBookingResponse(raw: Raw): MappedBookingResponse {
  const ticket = raw.ticket ?? {};
  return {
    success: raw.success === 1 || raw.success === true,
    errorDesc: raw.errorDesc ?? "",
    onward: mapBookingLeg(ticket.Onward),
    return: mapBookingLeg(ticket.Return),
    refId: raw.Status?.refID ?? "",
    clientId: raw.Status?.clientID ?? "",
    status: raw.Status?.status ?? "",
  };
}
