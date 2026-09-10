import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  AirportDto,
  CreateFlightBookingRequestDto,
  FlightApiLogDto,
  FlightApiStatusDto,
  FlightBookingDto,
  FlightDashboardDto,
  FlightPaymentOrderDto,
  FlightPriceCheckDto,
  FlightPricingSettingDto,
  FlightRoutePricingRuleDto,
  FlightSearchResultDto,
  SaveAirportDto,
  SaveFlightRoutePricingRuleDto,
  SearchFlightRequestDto,
  UpdateFlightPricingSettingDto,
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

export function useCancelFlightBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      apiFetch<FlightBookingDto>(`/customer/flight-bookings/${bookingId}/cancel`, { method: "POST", body: { reason } }),
    onSuccess: (_data, vars) => invalidateMyFlightBookings(queryClient, vars.bookingId),
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

function invalidateAdminFlightBooking(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: ["admin-flight-bookings"] });
  queryClient.invalidateQueries({ queryKey: ["admin-flight-bookings", "detail", id] });
}

export function useAdminCancelFlightBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, canMode }: { id: string; reason: string; canMode?: number }) =>
      apiFetch<FlightBookingDto>(`/admin/flights/bookings/${id}/cancel`, { method: "POST", body: { reason, canMode } }),
    onSuccess: (_data, vars) => invalidateAdminFlightBooking(queryClient, vars.id),
  });
}

export function useFlightDashboard() {
  return useQuery({ queryKey: ["admin-flight-dashboard"], queryFn: () => apiFetch<FlightDashboardDto>("/admin/flights/dashboard") });
}

// ---------------------------------------------------------------------------
// Admin — airport reference data
// ---------------------------------------------------------------------------

export function useAdminAirports() {
  return useQuery({ queryKey: ["admin-airports"], queryFn: () => apiFetch<AirportDto[]>("/admin/flights/airports") });
}

export function useCreateAirport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveAirportDto) => apiFetch<AirportDto>("/admin/flights/airports", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-airports"] }),
  });
}

export function useUpdateAirport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SaveAirportDto> }) => apiFetch<AirportDto>(`/admin/flights/airports/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-airports"] }),
  });
}

export function useDeleteAirport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/admin/flights/airports/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-airports"] }),
  });
}

export function useAdminRefundFlightBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, note }: { id: string; amount: number; note?: string }) =>
      apiFetch<FlightBookingDto>(`/admin/flights/bookings/${id}/refund`, { method: "POST", body: { amount, note } }),
    onSuccess: (_data, vars) => invalidateAdminFlightBooking(queryClient, vars.id),
  });
}

// ---------------------------------------------------------------------------
// Admin — pricing (margin/discount over the provider's fares)
// ---------------------------------------------------------------------------

export function useFlightPricingSetting() {
  return useQuery({ queryKey: ["admin-flight-pricing-setting"], queryFn: () => apiFetch<FlightPricingSettingDto>("/admin/flights/pricing/settings") });
}

export function useUpdateFlightPricingSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFlightPricingSettingDto) => apiFetch<FlightPricingSettingDto>("/admin/flights/pricing/settings", { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-flight-pricing-setting"] }),
  });
}

export function useFlightRoutePricingRules() {
  return useQuery({ queryKey: ["admin-flight-pricing-routes"], queryFn: () => apiFetch<FlightRoutePricingRuleDto[]>("/admin/flights/pricing/routes") });
}

function invalidateRoutePricingRules(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["admin-flight-pricing-routes"] });
}

export function useCreateFlightRoutePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveFlightRoutePricingRuleDto) => apiFetch<FlightRoutePricingRuleDto>("/admin/flights/pricing/routes", { method: "POST", body: payload }),
    onSuccess: () => invalidateRoutePricingRules(queryClient),
  });
}

export function useUpdateFlightRoutePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SaveFlightRoutePricingRuleDto> }) =>
      apiFetch<FlightRoutePricingRuleDto>(`/admin/flights/pricing/routes/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateRoutePricingRules(queryClient),
  });
}

export function useDeleteFlightRoutePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/admin/flights/pricing/routes/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateRoutePricingRules(queryClient),
  });
}
