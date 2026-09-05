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

export type FlightBookingStatus = "DRAFT" | "PENDING_PAYMENT" | "PENDING_CONFIRMATION" | "CONFIRMED" | "FAILED" | "CANCELLED";

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
  totalAmount: number;
  currency: string;
  status: FlightBookingStatus;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  pnr: string | null;
  providerStatus: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  passengers: FlightPassengerDto[];
  customerName?: string;
  customerEmail?: string;
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
