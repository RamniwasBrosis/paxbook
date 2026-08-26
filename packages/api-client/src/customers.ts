import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  CustomerDetailDto,
  CustomerDocumentDto,
  CustomerSummaryDto,
  SaveCustomerDocumentDto,
  SaveCustomerDto,
  SaveTravelerDto,
  TravelerDto,
} from "@paxbook/types";

function invalidateCustomer(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["customers"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["customers", id] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useCustomers() {
  return useQuery({ queryKey: ["customers"], queryFn: () => apiFetch<CustomerSummaryDto[]>("/customers") });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => apiFetch<CustomerDetailDto>(`/customers/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveCustomerDto) => apiFetch<CustomerSummaryDto>("/customers", { method: "POST", body: payload }),
    onSuccess: () => invalidateCustomer(queryClient),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveCustomerDto }) =>
      apiFetch<CustomerSummaryDto>(`/customers/${id}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.id),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateCustomer(queryClient),
  });
}

export function useAddTraveler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: SaveTravelerDto }) =>
      apiFetch<TravelerDto>(`/customers/${customerId}/travelers`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.customerId),
  });
}

export function useUpdateTraveler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, travelerId, payload }: { customerId: string; travelerId: string; payload: SaveTravelerDto }) =>
      apiFetch<TravelerDto>(`/customers/${customerId}/travelers/${travelerId}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.customerId),
  });
}

export function useDeleteTraveler() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, travelerId }: { customerId: string; travelerId: string }) =>
      apiFetch<{ id: string }>(`/customers/${customerId}/travelers/${travelerId}`, { method: "DELETE" }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.customerId),
  });
}

export function useAddCustomerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: SaveCustomerDocumentDto }) =>
      apiFetch<CustomerDocumentDto>(`/customers/${customerId}/documents`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.customerId),
  });
}

export function useDeleteCustomerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, documentId }: { customerId: string; documentId: string }) =>
      apiFetch<{ id: string }>(`/customers/${customerId}/documents/${documentId}`, { method: "DELETE" }),
    onSuccess: (_data, vars) => invalidateCustomer(queryClient, vars.customerId),
  });
}
