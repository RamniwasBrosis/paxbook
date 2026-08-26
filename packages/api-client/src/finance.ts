import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  EmiPlanDto,
  InvoiceDto,
  PaymentDto,
  RefundDto,
  SaveEmiPlanDto,
  SaveInvoiceDto,
  SavePaymentDto,
  SaveRefundDto,
  UpdatePaymentStatusDto,
  UpdateRefundStatusDto,
} from "@paxbook/types";

function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["payments"] });
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  queryClient.invalidateQueries({ queryKey: ["refunds"] });
  queryClient.invalidateQueries({ queryKey: ["bookings"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function usePayments() {
  return useQuery({ queryKey: ["payments"], queryFn: () => apiFetch<PaymentDto[]>("/payments") });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SavePaymentDto) => apiFetch<PaymentDto>("/payments", { method: "POST", body: payload }),
    onSuccess: () => invalidateFinance(queryClient),
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentStatusDto }) =>
      apiFetch<PaymentDto>(`/payments/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateFinance(queryClient),
  });
}

export function useInvoices() {
  return useQuery({ queryKey: ["invoices"], queryFn: () => apiFetch<InvoiceDto[]>("/invoices") });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveInvoiceDto) => apiFetch<InvoiceDto>("/invoices", { method: "POST", body: payload }),
    onSuccess: () => invalidateFinance(queryClient),
  });
}

export function useEmiPlan(bookingId: string | null) {
  return useQuery({
    queryKey: ["emi-plan", bookingId],
    queryFn: () => apiFetch<EmiPlanDto | null>(`/bookings/${bookingId}/emi-plan`),
    enabled: Boolean(bookingId),
  });
}

export function useSaveEmiPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: SaveEmiPlanDto }) =>
      apiFetch<EmiPlanDto>(`/bookings/${bookingId}/emi-plan`, { method: "PUT", body: payload }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["emi-plan", vars.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useDeleteEmiPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => apiFetch<{ bookingId: string }>(`/bookings/${bookingId}/emi-plan`, { method: "DELETE" }),
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["emi-plan", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useRefunds() {
  return useQuery({ queryKey: ["refunds"], queryFn: () => apiFetch<RefundDto[]>("/refunds") });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveRefundDto) => apiFetch<RefundDto>("/refunds", { method: "POST", body: payload }),
    onSuccess: () => invalidateFinance(queryClient),
  });
}

export function useUpdateRefundStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRefundStatusDto }) =>
      apiFetch<RefundDto>(`/refunds/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateFinance(queryClient),
  });
}
