import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { TenantIntegrationsDto, UpdateTenantIntegrationsDto } from "@paxbook/types";

export function useIntegrations() {
  return useQuery({ queryKey: ["settings", "integrations"], queryFn: () => apiFetch<TenantIntegrationsDto>("/settings/integrations") });
}

export function useUpdateIntegrations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTenantIntegrationsDto) => apiFetch<TenantIntegrationsDto>("/settings/integrations", { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "integrations"] }),
  });
}

export function useRunBackup() {
  return useMutation({
    mutationFn: () => apiFetch<{ file?: string; skipped?: string }>("/settings/backup/run", { method: "POST" }),
  });
}
