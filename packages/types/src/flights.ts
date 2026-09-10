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
// Booking
// ---------------------------------------------------------------------------

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
  createdAt: string;
  updatedAt: string;
  passengers: FlightPassengerDto[];
  customerName?: string;
  customerEmail?: string;
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

export interface FlightPricingSettingDto {
  marginPercent: number;
  marginFlat: number;
  updatedAt: string;
}

export interface UpdateFlightPricingSettingDto {
  marginPercent: number;
  marginFlat: number;
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
