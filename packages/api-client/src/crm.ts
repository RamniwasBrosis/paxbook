import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  AdminDirectoryEntryDto,
  ConsultantDto,
  LeadDetailDto,
  LeadSummaryDto,
  SaveConsultantDto,
  SaveLeadDto,
  SaveLeadFollowUpDto,
  SaveTaskDto,
  TaskDto,
  UpdateConsultantDto,
  UpdateLeadStatusDto,
} from "@paxbook/types";

export function useAdminDirectory() {
  return useQuery({ queryKey: ["crm-admins"], queryFn: () => apiFetch<AdminDirectoryEntryDto[]>("/crm/admins") });
}

function invalidateLeads(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["leads"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["leads", id] });
  queryClient.invalidateQueries({ queryKey: ["crm-consultants"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useLeads() {
  return useQuery({ queryKey: ["leads"], queryFn: () => apiFetch<LeadSummaryDto[]>("/leads") });
}

export function useLead(id: string | null) {
  return useQuery({ queryKey: ["leads", id], queryFn: () => apiFetch<LeadDetailDto>(`/leads/${id}`), enabled: Boolean(id) });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveLeadDto) => apiFetch<LeadSummaryDto>("/leads", { method: "POST", body: payload }),
    onSuccess: () => invalidateLeads(queryClient),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveLeadDto }) => apiFetch<LeadSummaryDto>(`/leads/${id}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateLeads(queryClient, vars.id),
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeadStatusDto }) =>
      apiFetch<LeadSummaryDto>(`/leads/${id}/status`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateLeads(queryClient, vars.id),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateLeads(queryClient),
  });
}

export function useAddLeadFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: SaveLeadFollowUpDto }) =>
      apiFetch(`/leads/${leadId}/follow-ups`, { method: "POST", body: payload }),
    onSuccess: (_data, vars) => invalidateLeads(queryClient, vars.leadId),
  });
}

export function useUpdateLeadFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, id, payload }: { leadId: string; id: string; payload: SaveLeadFollowUpDto }) =>
      apiFetch(`/leads/${leadId}/follow-ups/${id}`, { method: "PATCH", body: payload }),
    onSuccess: (_data, vars) => invalidateLeads(queryClient, vars.leadId),
  });
}

export function useDeleteLeadFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, id }: { leadId: string; id: string }) =>
      apiFetch<{ id: string }>(`/leads/${leadId}/follow-ups/${id}`, { method: "DELETE" }),
    onSuccess: (_data, vars) => invalidateLeads(queryClient, vars.leadId),
  });
}

function invalidateConsultants(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["crm-consultants"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useConsultants() {
  return useQuery({ queryKey: ["crm-consultants"], queryFn: () => apiFetch<ConsultantDto[]>("/crm/consultants") });
}

export function useCreateConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveConsultantDto) => apiFetch<ConsultantDto>("/crm/consultants", { method: "POST", body: payload }),
    onSuccess: () => invalidateConsultants(queryClient),
  });
}

export function useUpdateConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateConsultantDto }) =>
      apiFetch<ConsultantDto>(`/crm/consultants/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateConsultants(queryClient),
  });
}

export function useDeleteConsultant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/crm/consultants/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateConsultants(queryClient),
  });
}

function invalidateTasks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["crm-tasks"] });
  queryClient.invalidateQueries({ queryKey: ["audit-log"] });
}

export function useTasks() {
  return useQuery({ queryKey: ["crm-tasks"], queryFn: () => apiFetch<TaskDto[]>("/crm/tasks") });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveTaskDto) => apiFetch<TaskDto>("/crm/tasks", { method: "POST", body: payload }),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveTaskDto }) => apiFetch<TaskDto>(`/crm/tasks/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/crm/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateTasks(queryClient),
  });
}
