import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  ProvisionPortalAccessResultDto,
  ProvisionVendorPortalAccessDto,
  SaveVendorContractDto,
  SaveVendorDto,
  SaveVendorPaymentDto,
  VendorCategoryType,
  VendorContractDto,
  VendorDetailDto,
  VendorDto,
  VendorPaymentDto,
} from "@paxbook/types";

function invalidateVendors(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["vendors"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["vendors", id] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useVendors(categoryType?: VendorCategoryType) {
  return useQuery({
    queryKey: ["vendors", "list", categoryType ?? "all"],
    queryFn: () => apiFetch<VendorDto[]>(`/vendors${categoryType ? `?categoryType=${categoryType}` : ""}`),
  });
}

export function useVendor(id: string | null) {
  return useQuery({ queryKey: ["vendors", id], queryFn: () => apiFetch<VendorDetailDto>(`/vendors/${id}`), enabled: Boolean(id) });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveVendorDto) => apiFetch<VendorDto>("/vendors", { method: "POST", body: payload }),
    onSuccess: () => invalidateVendors(queryClient),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveVendorDto }) => apiFetch<VendorDto>(`/vendors/${id}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateVendors(queryClient, vars.id),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/vendors/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateVendors(queryClient),
  });
}

export function useAddVendorContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, payload }: { vendorId: string; payload: SaveVendorContractDto }) =>
      apiFetch<VendorContractDto>(`/vendors/${vendorId}/contracts`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateVendors(queryClient, vars.vendorId),
  });
}

export function useDeleteVendorContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, id }: { vendorId: string; id: string }) =>
      apiFetch<{ id: string }>(`/vendors/${vendorId}/contracts/${id}`, { method: "DELETE" }),
    onSuccess: (_data, vars) => invalidateVendors(queryClient, vars.vendorId),
  });
}

export function useVendorPayments(vendorId?: string) {
  return useQuery({
    queryKey: ["vendor-payments", vendorId ?? "all"],
    queryFn: () => apiFetch<VendorPaymentDto[]>(`/vendor-payments${vendorId ? `?vendorId=${vendorId}` : ""}`),
  });
}

export function useCreateVendorPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveVendorPaymentDto) => apiFetch<VendorPaymentDto>("/vendor-payments", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useMarkVendorPaymentPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<VendorPaymentDto>(`/vendor-payments/${id}/mark-paid`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useProvisionVendorPortalAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProvisionVendorPortalAccessDto }) =>
      apiFetch<ProvisionPortalAccessResultDto>(`/vendors/${id}/portal-access`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateVendors(queryClient, vars.id),
  });
}

export function useResetVendorPortalPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ temporaryPassword: string }>(`/vendors/${id}/portal-access/reset-password`, { method: "POST" }),
    onSuccess: (_data, id) => invalidateVendors(queryClient, id),
  });
}
