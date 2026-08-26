import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { TenantBrandingDto, UpdateTenantBrandingDto } from "@paxbook/types";

export function useBranding() {
  return useQuery({ queryKey: ["settings", "branding"], queryFn: () => apiFetch<TenantBrandingDto>("/settings/branding") });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTenantBrandingDto) => apiFetch<TenantBrandingDto>("/settings/branding", { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "branding"] }),
  });
}
