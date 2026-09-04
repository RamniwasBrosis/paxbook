import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  CreateFlightBookingRequestDto,
  FlightApiLogDto,
  FlightApiStatusDto,
  FlightBookingDto,
  FlightPaymentOrderDto,
  FlightPriceCheckDto,
  FlightSearchResultDto,
  SearchFlightRequestDto,
  VerifyFlightPaymentDto,
} from "@paxbook/types";

// ---------------------------------------------------------------------------
// Public / customer-facing search — no login required
// ---------------------------------------------------------------------------

export function useFlightSearch() {
  return useMutation({
    mutationFn: (payload: SearchFlightRequestDto) => apiFetch<FlightSearchResultDto>("/public/flights/search", { method: "POST", body: payload }),
  });
}

export function useFareDetails() {
  return useMutation({
    mutationFn: (payload: { flightID: number; refID: string }) =>
      apiFetch<FlightSearchResultDto>("/public/flights/fare-details", { method: "POST", body: payload }),
  });
}

export function usePriceCheck() {
  return useMutation({
    mutationFn: (payload: { flightID: number; refID: string }) =>
      apiFetch<FlightPriceCheckDto>("/public/flights/price-check", { method: "POST", body: payload }),
  });
}

export function useFareRules() {
  return useMutation({
    mutationFn: (flightID: number) => apiFetch<Record<string, unknown>>(`/public/flights/fare-rules?flightID=${flightID}`),
  });
}

// ---------------------------------------------------------------------------
// Customer — authenticated booking + payment flow
// ---------------------------------------------------------------------------

function invalidateMyFlightBookings(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["my-flight-bookings"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["my-flight-bookings", id] });
}

export function useMyFlightBookings() {
  return useQuery({ queryKey: ["my-flight-bookings"], queryFn: () => apiFetch<FlightBookingDto[]>("/customer/flight-bookings") });
}

export function useMyFlightBooking(id: string | null) {
  return useQuery({
    queryKey: ["my-flight-bookings", id],
    queryFn: () => apiFetch<FlightBookingDto>(`/customer/flight-bookings/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateFlightBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFlightBookingRequestDto) => apiFetch<FlightBookingDto>("/customer/flight-bookings", { method: "POST", body: payload }),
    onSuccess: () => invalidateMyFlightBookings(queryClient),
  });
}

export function useCreateFlightPaymentOrder() {
  return useMutation({
    mutationFn: (bookingId: string) => apiFetch<FlightPaymentOrderDto>(`/customer/flight-bookings/${bookingId}/payment/order`, { method: "POST" }),
  });
}

export function useVerifyFlightPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, paymentId, payload }: { bookingId: string; paymentId: string; payload: VerifyFlightPaymentDto }) =>
      apiFetch<FlightBookingDto>(`/customer/flight-bookings/${bookingId}/payment/${paymentId}/verify`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateMyFlightBookings(queryClient, vars.bookingId),
  });
}

export function useRefreshFlightBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => apiFetch<FlightBookingDto>(`/customer/flight-bookings/${bookingId}/refresh-status`, { method: "POST" }),
    onSuccess: (_data, vars) => invalidateMyFlightBookings(queryClient, vars),
  });
}

// ---------------------------------------------------------------------------
// Admin — live API test tool + call log
// ---------------------------------------------------------------------------

export function useFlightApiStatus() {
  return useQuery({ queryKey: ["admin-flight-api-status"], queryFn: () => apiFetch<FlightApiStatusDto>("/admin/flights/api/status") });
}

export function useAdminFlightSearch() {
  return useMutation({
    mutationFn: (payload: SearchFlightRequestDto) => apiFetch<FlightSearchResultDto>("/admin/flights/api/search", { method: "POST", body: payload }),
  });
}

export function useAdminFareDetails() {
  return useMutation({
    mutationFn: (payload: { flightID: number; refID: string }) =>
      apiFetch<FlightSearchResultDto>("/admin/flights/api/fare-details", { method: "POST", body: payload }),
  });
}

export function useAdminPriceCheck() {
  return useMutation({
    mutationFn: (payload: { flightID: number; refID: string }) =>
      apiFetch<FlightPriceCheckDto>("/admin/flights/api/price-check", { method: "POST", body: payload }),
  });
}

export function useAdminFareRules() {
  return useMutation({
    mutationFn: (flightID: number) => apiFetch<Record<string, unknown>>(`/admin/flights/api/fare-rules?flightID=${flightID}`),
  });
}

export function useFlightApiLogs(filters?: { limit?: number; endpoint?: string; success?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.endpoint) params.set("endpoint", filters.endpoint);
  if (filters?.success !== undefined) params.set("success", String(filters.success));
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin-flight-api-logs", filters],
    queryFn: () => apiFetch<FlightApiLogDto[]>(`/admin/flights/api/logs${qs ? `?${qs}` : ""}`),
    refetchInterval: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Admin — bookings management
// ---------------------------------------------------------------------------

export function useAdminFlightBookings(status?: string) {
  return useQuery({
    queryKey: ["admin-flight-bookings", status],
    queryFn: () => apiFetch<FlightBookingDto[]>(`/admin/flights/bookings${status ? `?status=${status}` : ""}`),
  });
}

export function useAdminFlightBooking(id: string | null) {
  return useQuery({
    queryKey: ["admin-flight-bookings", "detail", id],
    queryFn: () => apiFetch<FlightBookingDto>(`/admin/flights/bookings/${id}`),
    enabled: Boolean(id),
  });
}
