import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type { PackageDetailDto, PackageSummaryDto, SavePackageDto } from "@paxbook/types";

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: () => apiFetch<PackageSummaryDto[]>("/packages"),
  });
}

export function usePackage(id: string | null) {
  return useQuery({
    queryKey: ["packages", id],
    queryFn: () => apiFetch<PackageDetailDto>(`/packages/${id}`),
    enabled: Boolean(id),
  });
}

function useInvalidatePackages() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["packages"] });
    queryClient.invalidateQueries({ queryKey: ["audit-log"] });
  };
}

export function useCreatePackage() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: (payload: SavePackageDto) => apiFetch<PackageDetailDto>("/packages", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useUpdatePackage() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SavePackageDto }) =>
      apiFetch<PackageDetailDto>(`/packages/${id}`, { method: "PATCH", body: payload }),
    onSuccess: invalidate,
  });
}

export function useSetPackagePublished() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      apiFetch<PackageDetailDto>(`/packages/${id}/${published ? "publish" : "unpublish"}`, { method: "PATCH" }),
    onSuccess: invalidate,
  });
}

export function useDeletePackage() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/packages/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
