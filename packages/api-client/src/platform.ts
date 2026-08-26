import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { PlanDto, SavePlanDto, TenantSummaryDto, UpdateTenantStatusDto } from "@paxbook/types";

/** Public — no auth required, consumed by the tenant-signup form. */
export function usePublicPlans() {
  return useQuery({ queryKey: ["platform", "plans", "public"], queryFn: () => apiFetch<PlanDto[]>("/platform/plans/public") });
}

export function usePlatformTenants() {
  return useQuery({ queryKey: ["platform", "tenants"], queryFn: () => apiFetch<TenantSummaryDto[]>("/platform/tenants") });
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTenantStatusDto }) =>
      apiFetch<TenantSummaryDto>(`/platform/tenants/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform", "tenants"] }),
  });
}

export function usePlatformPlans() {
  return useQuery({ queryKey: ["platform", "plans"], queryFn: () => apiFetch<PlanDto[]>("/platform/plans") });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SavePlanDto) => apiFetch<PlanDto>("/platform/plans", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "plans"] });
      queryClient.invalidateQueries({ queryKey: ["platform", "plans", "public"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SavePlanDto }) => apiFetch<PlanDto>(`/platform/plans/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "plans"] });
      queryClient.invalidateQueries({ queryKey: ["platform", "plans", "public"] });
    },
  });
}
