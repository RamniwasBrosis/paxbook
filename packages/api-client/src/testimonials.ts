import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { SaveTestimonialDto, TestimonialDto } from "@paxbook/types";

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () => apiFetch<TestimonialDto[]>("/testimonials"),
  });
}

export function useTestimonial(id: string | null) {
  return useQuery({
    queryKey: ["testimonials", id],
    queryFn: () => apiFetch<TestimonialDto>(`/testimonials/${id}`),
    enabled: Boolean(id),
  });
}

function useInvalidateTestimonials() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    queryClient.invalidateQueries({ queryKey: ["audit-log"] });
  };
}

export function useCreateTestimonial() {
  const invalidate = useInvalidateTestimonials();
  return useMutation({
    mutationFn: (payload: SaveTestimonialDto) => apiFetch<TestimonialDto>("/testimonials", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useUpdateTestimonial() {
  const invalidate = useInvalidateTestimonials();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveTestimonialDto }) =>
      apiFetch<TestimonialDto>(`/testimonials/${id}`, { method: "PATCH", body: payload }),
    onSuccess: invalidate,
  });
}

export function useSetTestimonialPublished() {
  const invalidate = useInvalidateTestimonials();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      apiFetch<TestimonialDto>(`/testimonials/${id}/${published ? "publish" : "unpublish"}`, { method: "PATCH" }),
    onSuccess: invalidate,
  });
}

export function useDeleteTestimonial() {
  const invalidate = useInvalidateTestimonials();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/testimonials/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
