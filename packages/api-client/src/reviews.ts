import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { ModerateReviewDto, ReviewDto, SaveReviewDto } from "@paxbook/types";

function invalidateReviews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["reviews"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useReviews() {
  return useQuery({ queryKey: ["reviews"], queryFn: () => apiFetch<ReviewDto[]>("/reviews") });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveReviewDto) => apiFetch<ReviewDto>("/reviews", { method: "POST", body: payload }),
    onSuccess: () => invalidateReviews(queryClient),
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ModerateReviewDto }) =>
      apiFetch<ReviewDto>(`/reviews/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateReviews(queryClient),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateReviews(queryClient),
  });
}
