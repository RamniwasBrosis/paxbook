import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@paxbook/auth-client";
import type { AdminUserDto, CreateAdminUserDto, RoleDto, AuditLogEntryDto } from "@paxbook/types";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<AdminUserDto[]>("/users"),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminUserDto) =>
      apiFetch<AdminUserDto>("/users", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => apiFetch<RoleDto[]>("/roles"),
  });
}

export function useAuditLog(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["audit-log", page, pageSize],
    queryFn: () => apiFetchPaginated<AuditLogEntryDto[]>(`/audit-log?page=${page}&pageSize=${pageSize}`),
  });
}
