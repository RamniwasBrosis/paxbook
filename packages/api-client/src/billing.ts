import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { BillingActivationOrderDto, ConfirmBillingActivationDto, SubscriptionDto } from "@paxbook/types";

export function useSubscription() {
  return useQuery({ queryKey: ["settings", "billing"], queryFn: () => apiFetch<SubscriptionDto>("/settings/billing") });
}

export function useCreateBillingActivation() {
  return useMutation({
    mutationFn: () => apiFetch<BillingActivationOrderDto>("/settings/billing/activate", { method: "POST" }),
  });
}

export function useConfirmBillingActivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmBillingActivationDto) => apiFetch<SubscriptionDto>("/settings/billing/confirm", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "billing"] }),
  });
}
