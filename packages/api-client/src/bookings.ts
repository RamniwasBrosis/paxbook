import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  BookingDetailDto,
  BookingSummaryDto,
  CancellationRequestDto,
  ResolveCancellationRequestDto,
  SaveBookingDto,
  SaveBookingVoucherDto,
  SyncBookingTravelersDto,
  UpdateBookingStatusDto,
} from "@paxbook/types";

function invalidateBooking(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["bookings"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["bookings", id] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useBookings() {
  return useQuery({ queryKey: ["bookings"], queryFn: () => apiFetch<BookingSummaryDto[]>("/bookings") });
}

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => apiFetch<BookingDetailDto>(`/bookings/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveBookingDto) => apiFetch<BookingDetailDto>("/bookings", { method: "POST", body: payload }),
    onSuccess: () => invalidateBooking(queryClient),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveBookingDto }) =>
      apiFetch<BookingDetailDto>(`/bookings/${id}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateBooking(queryClient, vars.id),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBookingStatusDto }) =>
      apiFetch<BookingDetailDto>(`/bookings/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateBooking(queryClient, vars.id),
  });
}

export function useSyncBookingTravelers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SyncBookingTravelersDto }) =>
      apiFetch<BookingDetailDto>(`/bookings/${id}/travelers`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateBooking(queryClient, vars.id),
  });
}

export function useUploadBookingVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveBookingVoucherDto }) =>
      apiFetch<BookingDetailDto>(`/bookings/${id}/voucher`, { method: "PUT", body: payload }),
    onSuccess: (_data, vars) => invalidateBooking(queryClient, vars.id),
  });
}

export function useCancellationRequests() {
  return useQuery({
    queryKey: ["cancellation-requests"],
    queryFn: () => apiFetch<CancellationRequestDto[]>("/admin/cancellation-requests"),
  });
}

export function useResolveCancellationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveCancellationRequestDto }) =>
      apiFetch<CancellationRequestDto>(`/admin/cancellation-requests/${id}/resolve`, { method: "PATCH", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-requests"] });
      invalidateBooking(queryClient);
    },
  });
}
