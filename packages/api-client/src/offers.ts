import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { CouponDto, SaveCouponDto } from "@paxbook/types";

function invalidateOffers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["offers"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useCoupons() {
  return useQuery({ queryKey: ["offers"], queryFn: () => apiFetch<CouponDto[]>("/offers") });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveCouponDto) => apiFetch<CouponDto>("/offers", { method: "POST", body: payload }),
    onSuccess: () => invalidateOffers(queryClient),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveCouponDto }) =>
      apiFetch<CouponDto>(`/offers/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateOffers(queryClient),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/offers/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateOffers(queryClient),
  });
}
