// Normalized shapes for the FTD Travel Air API integration. The provider's raw JSON uses
// numeric-string-keyed leg objects ("Onward": {"0": {...}, "1": {...}, "durTotal": "..."}) and
// inconsistent casing — the API layer maps that into these clean, array-based shapes so the
// frontend never has to know about the provider's wire format.

export interface FlightLegDto {
  flightId: string | null;
  depCode: string;
  depCityName: string;
  depAirportName: string;
  depTerminal: string | null;
  /** ISO 8601 */
  depDateTime: string;
  flightNo: string;
  airlineCode: string;
  airlineName: string;
  operatingAirlineCode: string;
  operatingAirlineName: string;
  arrCode: string;
  arrCityName: string;
  arrAirportName: string;
  arrTerminal: string | null;
  /** ISO 8601 */
  arrDateTime: string;
  cabin: string;
  fareClass: string;
  durationMinutes: number;
  layoverAirport: string | null;
  aircraftType: string | null;
}

export interface FlightFareDto {
  baggageCheckIn: string;
  baggageCabin: string;
  seatsAvailable: string;
  refundable: boolean;
  fareTypeIndex: number;
  fareTypeLabel: string;
  popupMessage: string | null;
  base: number;
  tax: number;
  total: number;
  netFare: number;
  incentive: number;
  tds: number;
  agentMarkup: number;
}

// ---------------------------------------------------------------------------
// Fare rules — used to compute a real cancellation-fee estimate at cancel time.
// FTD's own spec says "Either of them will be available": a structured, computable
// cancellation-fee schedule, OR just an HTML blob with no usable numbers. Modeled
// as a discriminated union rather than optional fields so callers can't accidentally
// read `cancellation` off an html-only response.
// ---------------------------------------------------------------------------

/** One cancellation-fee window from FTD's structured Fare Rules policy — field names mirror the
 * provider's own wire vocabulary (start/end/amount_type) since this is a thin typing of their
 * shape, not a redesign. See FlightCancellationEstimateDto / flight-cancellation-estimate.service.ts
 * for the open questions (confirmed against real data before trusting this) about which of
 * start/end is closer to departure, and whether amount is per-passenger or per-booking. */
export interface FareRuleWindowDto {
  journeySegment: string;
  start: number;
  end: number;
  /** 0 = hours, 1 = days */
  startType: 0 | 1;
  /** 0 = hours, 1 = days */
  endType: 0 | 1;
  amount: number;
  /** 0 = fixed ₹ amount, 1 = percentage */
  amountType: 0 | 1;
  remarks: string;
}

export type FareRulesDto =
  | { kind: "structured"; genRemarks: string | null; cancellation: FareRuleWindowDto[]; reissue: Record<string, unknown>[]; noshow: Record<string, unknown>[]; seat: Record<string, unknown>[] }
  | { kind: "html"; genRemarks: string | null; html: string };

/** Always an ESTIMATE — a human (customer or admin) reviews it, it's never auto-applied to the
 * actual Razorpay refund. `available: false` is a normal, expected outcome (HTML-only fare rules,
 * no matching journey segment, provider call failed, etc.), not an error — callers must fall back
 * to the existing qualitative-only refundable/non-refundable messaging in that case. */
export interface FlightCancellationEstimateDto {
  available: boolean;
  estimatedRefundAmount: number | null;
  cancellationFee: number | null;
  currency: string;
  /** Always safe to show a customer as-is — either the basis for a real number, or a plain-language
   * explanation of why none could be computed. */
  note: string;
  computedAt: string;
}

export interface FlightValidationDto {
  isLowCostCarrier: boolean;
  freeMeal: boolean;
  /** 0 not allowed, 1 mandatory, 2 optional */
  gstIndicator: number;
  allowFrequentFlyer: boolean;
  suggestedFirstName?: string;
  suggestedLastName?: string;
  remarks?: string | null;
  docMandatory?: boolean;
  baggageMandatory?: boolean;
  mealMandatory?: boolean;
  seatMandatory?: boolean;
  panMandatory?: boolean;
  documentType?: string;
}

export interface FlightOptionDto {
  /** flightID for the onward leg group — pass to Fare Details / Price Check. */
  id: string;
  legs: FlightLegDto[];
  durationTotalMinutes: number;
  stops: number;
  fare: FlightFareDto;
  validation: FlightValidationDto;
  returnLegs?: FlightLegDto[];
  returnDurationTotalMinutes?: number;
  returnStops?: number;
  returnFare?: FlightFareDto;
}

export interface FlightSearchResultDto {
  refId: string;
  isComplete: boolean;
  options: FlightOptionDto[];
}

/** Admin-only variant of FlightOptionDto that also carries the FTD provider's real (pre-margin)
 * fare and the exact margin rule that was applied — used by the Pricing page's live search so an
 * admin can see provider cost vs. customer price side by side when deciding what margin to set. */
export interface AdminFlightOptionDto extends FlightOptionDto {
  providerFareTotal: number;
  effectiveMarginPercent: number;
  effectiveMarginFlat: number;
  /** Which of the two margin numbers above is actually applied — only one ever takes effect. */
  effectiveMarginType: "PERCENT" | "FLAT";
}

export interface AdminFlightSearchResultDto {
  refId: string;
  isComplete: boolean;
  options: AdminFlightOptionDto[];
}

export interface FlightBaggageOptionDto {
  id: string;
  amount: number;
  description: string;
  paxType: "Adult" | "Child" | "All";
}

export interface FlightMealOptionDto {
  id: string;
  amount: number;
  description: string;
  legRef: number;
  paxType: "Adult" | "Child" | "All";
}

export interface FlightSsrDto {
  onward: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] };
  return?: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] };
  webCheckinEnabled: boolean;
  webCheckinAmount: number;
}

export interface FlightPriceCheckDto {
  option: FlightOptionDto;
  ssr: FlightSsrDto | null;
}

// ---------------------------------------------------------------------------
// Seat selection — fetched via its own lookup call (needs real passenger names,
// unlike baggage/meal which come bundled in price-check), so it's modeled
// separately from FlightSsrDto rather than folded into it.
// ---------------------------------------------------------------------------

/** One seat in the cabin grid, as returned by FTD's seat-map lookup. The inverted-sounding
 * `isBooked` naming is FTD's own: true means the seat IS available, false means it is NOT — this is
 * confirmed against the provider's spec, not a bug; never "fix" it, just handle it correctly
 * wherever it's read. These lookup-only fields (row/col/isBooked/isAisle) don't exist in the
 * narrower shape that round-trips into the actual booking payload. */
export interface FlightSeatOptionDto {
  row: number;
  col: string;
  seatID: string;
  isBooked: boolean;
  isAisle: boolean;
  seatName: string;
  seatAmt: number;
  paxType: "Adult" | "Child" | "All";
}

/** One leg/segment's seat grid — FTD returns one SeatMap array per physical flight segment, so a
 * connecting itinerary has more than one entry per direction. */
export interface FlightSeatMapDto {
  seatMap: FlightSeatOptionDto[];
}

export interface FlightSeatLookupResultDto {
  onward: FlightSeatMapDto[];
  return?: FlightSeatMapDto[];
}

/** FTD's seat lookup needs real passenger names (unlike price-check/fare-details), so this is only
 * called once names are typed and validated in the booking wizard. */
export interface FlightSeatLookupPassengerDto {
  title: string;
  fName: string;
  lName: string;
  pType: "A" | "C" | "I";
}

export interface FlightSeatLookupRequestDto {
  flightID: number;
  refID: string;
  passengers: FlightSeatLookupPassengerDto[];
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

/** A passenger's chosen baggage/meal add-ons for one leg direction — only ids, never an amount.
 * The server re-validates every id against the SSR options the just-completed price-check actually
 * quoted and reads the real price from there, so there is nowhere for a client to submit a price. */
export interface FlightSsrSelectionDto {
  baggageId?: string;
  /** One mealID per distinct legRef the passenger wants a meal for — usually one entry, since most
   * flights have a single leg-ref group; more for a multi-segment journey with per-segment meals. */
  mealIds?: string[];
  /** Chosen seat's seatID for this leg direction — only an id, never an amount. The server
   * re-validates against a fresh seat-map lookup at booking time and reads the real seatAmt/seatName
   * from there, same "never trust a client amount" pattern as baggage/meal. */
  seatId?: string;
}

export interface FlightPassengerSsrInputDto {
  onward?: FlightSsrSelectionDto;
  return?: FlightSsrSelectionDto;
}

export interface FlightPassengerInputDto {
  title: string;
  fName: string;
  lName: string;
  pType: "A" | "C" | "I";
  gender: "M" | "F";
  dob: string; // DD-MM-YYYY
  documentId?: string;
  ppNo?: string;
  ppIss?: string;
  ppExp?: string;
  ppNat?: string;
  ssr?: FlightPassengerSsrInputDto;
}

export interface FlightGstInputDto {
  number: string;
  email: string;
  mobile: string;
  address: string;
  company: string;
}

export interface SearchFlightRequestDto {
  tripType: number;
  serType: number;
  depCity: string;
  arrCity: string;
  onDate: string;
  reDate?: string;
  adt: number;
  chd: number;
  inf: number;
  cabin: string;
  fareType: string;
  refID?: string;
}

export interface CreateFlightBookingRequestDto {
  flightID: number;
  refID: string;
  passengers: FlightPassengerInputDto[];
  mobile: string;
  email: string;
  firstPaxPanNo?: string;
  webCheckin?: boolean;
  gst?: FlightGstInputDto;
  searchContext: SearchFlightRequestDto;
}

export type FlightBookingStatus = "DRAFT" | "PENDING_PAYMENT" | "PENDING_CONFIRMATION" | "CONFIRMED" | "FAILED" | "CANCELLATION_PENDING" | "CANCELLED";

export interface FlightPassengerDto {
  id: string;
  title: string;
  fName: string;
  lName: string;
  pType: string;
  gender: string;
  dob: string;
  documentId: string | null;
  ppNo: string | null;
  ppNat: string | null;
  paxId: string | null;
  pnr: string | null;
  ticketNo: string | null;
}

export interface FlightBookingDto {
  id: string;
  clientId: string;
  refId: string | null;
  depCity: string;
  arrCity: string;
  onDate: string;
  reDate: string | null;
  adt: number;
  chd: number;
  inf: number;
  cabin: string;
  /** The exact flight(s) actually booked — frozen from the price-check snapshot at booking time, so
   * always the real thing the customer paid for. Empty for bookings made before this was tracked. */
  legs: FlightLegDto[];
  returnLegs: FlightLegDto[] | null;
  /** Baggage allowance, refundability, and fare type from that same snapshot. Null for older bookings. */
  fare: FlightFareDto | null;
  /** The provider's own fare total before our margin/discount was applied — null for bookings made before this was tracked. */
  providerFareAmount: number | null;
  totalAmount: number;
  currency: string;
  status: FlightBookingStatus;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  pnr: string | null;
  providerStatus: string | null;
  errorMessage: string | null;
  /** Reason sent to the provider when cancelling (customer- or admin-supplied). */
  cancellationReason: string | null;
  /** Raw per-passenger provider cancel status, e.g. "Cancelled" or "Pending Cancelled" — joined for display. */
  cancellationStatus: string | null;
  cancelledAt: string | null;
  /** What was actually refunded to the customer via Razorpay — distinct from FTD's own wallet-side credit. */
  refundAmount: number | null;
  refundedAt: string | null;
  refundReference: string | null;
  /** A real, provider-backed estimate frozen at the moment cancellation was requested (see
   * FlightsService.cancelBooking) — max(0, providerFareAmount - estimatedCancellationFee). Null
   * when no computable Fare Rules match was found (HTML-only fare, no journey_segment match, the
   * provider call failed, etc.) — the admin refund flow then falls back to fully-manual entry.
   * Always an estimate for a human to review, never auto-applied to the actual Razorpay refund. */
  estimatedRefundAmount: number | null;
  /** The airline's own cancellation fee this estimate deducted — never includes Paxbook's margin,
   * which is never refunded regardless of when the customer cancels. */
  estimatedCancellationFee: number | null;
  refundEstimateComputedAt: string | null;
  /** Human-readable basis for the estimate, or why none was computable — see
   * FlightCancellationEstimateDto.note. Always safe to show a customer or admin as-is. */
  refundEstimateNote: string | null;
  /** Set when this booking is one leg of a domestic round trip (see FlightTripDto) — null for a
   * standalone one-way booking, or for the onward leg of a genuine FTD-bundled international round trip. */
  tripId: string | null;
  tripRole: "ONWARD" | "RETURN" | null;
  /** Customer-requested date change via FTD's Reissue Quotation endpoint — a real submitted request,
   * not an instant self-service change. FTD's spec: "No changes are done in this request"; any further
   * processing (fare difference, rebooking) happens out-of-band using dateChangeReissueId. */
  dateChangeRequestedAt: string | null;
  dateChangeNewDate: string | null;
  dateChangeRemarks: string | null;
  dateChangeReissueId: string | null;
  dateChangeStatus: string | null;
  createdAt: string;
  updatedAt: string;
  passengers: FlightPassengerDto[];
  customerName?: string;
  customerEmail?: string;
}

// ---------------------------------------------------------------------------
// Domestic round trips — per FTD's own spec ("Domestic Round Trip are two One
// Way bookings"), modeled as two linked one-way bookings sharing a tripId,
// rather than a single provider-side round-trip booking (which domestic
// simply doesn't support).
// ---------------------------------------------------------------------------

export interface RoundTripLegRequestDto {
  flightID: number;
  refID: string;
  searchContext: SearchFlightRequestDto;
}

export interface CreateRoundTripBookingRequestDto {
  onward: RoundTripLegRequestDto;
  return: RoundTripLegRequestDto;
  passengers: FlightPassengerInputDto[];
  mobile: string;
  email: string;
  firstPaxPanNo?: string;
  gst?: FlightGstInputDto;
}

export interface FlightTripDto {
  tripId: string;
  onward: FlightBookingDto;
  return: FlightBookingDto;
  totalAmount: number;
  currency: string;
}

export interface RequestFlightCancellationDto {
  reason: string;
}

export interface AdminCancelFlightBookingDto {
  reason: string;
  /** 2 Missed/No-show, 5 Customer cancel (default), 6 Already cancelled, 7 Flight cancelled, 8 Time changed. */
  canMode?: number;
}

export interface ProcessFlightRefundDto {
  amount: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// Admin — pricing (margin/discount over the provider's fares)
// ---------------------------------------------------------------------------

/** "PERCENT" or "FLAT" — which margin number is actually applied. They used to always stack
 * together, which made it impossible to tell what a rule would actually charge; now exactly one
 * applies, and the unused number is just kept around so switching modes doesn't lose it. */
export type FlightMarginType = "PERCENT" | "FLAT";

export interface FlightPricingSettingDto {
  marginPercent: number;
  marginFlat: number;
  marginType: FlightMarginType;
  updatedAt: string;
}

export interface UpdateFlightPricingSettingDto {
  marginPercent: number;
  marginFlat: number;
  marginType: FlightMarginType;
}

export interface FlightRoutePricingRuleDto {
  id: string;
  depCity: string;
  arrCity: string;
  /** null = applies to every flight on the route; set = this exact airline+flight number only. */
  airlineCode: string | null;
  flightNo: string | null;
  /** null = applies to every cabin; E/P/B/F = Economy/Premium Economy/Business/First only. */
  cabin: string | null;
  /** Internal note only, e.g. "Diwali sale on 6E-2314" — never shown to customers. */
  label: string | null;
  marginPercent: number;
  marginFlat: number;
  marginType: FlightMarginType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveFlightRoutePricingRuleDto {
  depCity: string;
  arrCity: string;
  airlineCode?: string;
  flightNo?: string;
  cabin?: string;
  label?: string;
  marginPercent: number;
  marginFlat: number;
  marginType: FlightMarginType;
  isActive?: boolean;
}

export interface FlightPaymentOrderDto {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

export interface VerifyFlightPaymentDto {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  devConfirm?: boolean;
}

// ---------------------------------------------------------------------------
// Admin — dashboard
// ---------------------------------------------------------------------------

export interface FlightDashboardStatusCountDto {
  status: string;
  count: number;
}

export interface FlightDashboardBreakdownDto {
  /** e.g. "DEL → BOM" for a route, or "IndiGo (6E)" for an airline. */
  label: string;
  bookings: number;
  revenue: number;
}

export interface FlightDashboardDailyFigureDto {
  /** YYYY-MM-DD */
  date: string;
  bookings: number;
  revenue: number;
}

export interface FlightDashboardDto {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  failedBookings: number;
  /** Sum of what customers paid on bookings that actually collected payment. */
  revenue: number;
  /** Sum of the provider's real fare on those same bookings — our actual cost. */
  supplierCost: number;
  /** revenue - supplierCost, i.e. gross margin before refunds. */
  margin: number;
  /** Sum actually refunded to customers via Razorpay. */
  refunded: number;
  /** margin - refunded. */
  netProfit: number;
  byStatus: FlightDashboardStatusCountDto[];
  byPaymentStatus: FlightDashboardStatusCountDto[];
  /** Top 10 by revenue. Derived from the real leg data on each booking — never guessed. */
  topRoutes: FlightDashboardBreakdownDto[];
  topAirlines: FlightDashboardBreakdownDto[];
  dailyLast30Days: FlightDashboardDailyFigureDto[];
}

// ---------------------------------------------------------------------------
// Admin — live API test tool + logs
// ---------------------------------------------------------------------------

export interface FlightApiLogDto {
  id: string;
  endpoint: string;
  requestBody: unknown;
  responseBody: unknown;
  statusCode: number | null;
  success: boolean;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface FlightApiStatusDto {
  configured: boolean;
  mode: number;
  balance: string | null;
}

// ---------------------------------------------------------------------------
// Admin — FTD's real daily transaction statement (booking fees, refunds, commission,
// markup, TDS, payment charges) — cached per date server-side, see FlightStatementDay.
// ---------------------------------------------------------------------------

export interface FlightStatementEntryDto {
  sNo: number;
  valueDate: string;
  transactionType: string;
  transactionRef: string;
  debit: number;
  credit: number;
  transactionAmount: number;
  commission: number;
  txnFees: number;
  tds: number;
  paymentCharge: number;
  bookingBalance: number;
  markup: number;
  insuranceCharge: number;
  remarks: string;
}

export interface FlightStatementResultDto {
  date: string;
  entries: FlightStatementEntryDto[];
  fetchedAt: string;
  fromCache: boolean;
}

// ---------------------------------------------------------------------------
// Admin — airport reference data (drives the public search autocomplete)
// ---------------------------------------------------------------------------

export interface AirportDto {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAirportDto {
  code: string;
  name: string;
  city: string;
  country: string;
  isActive?: boolean;
}
