import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  CountryDto,
  CreateDestinationDto,
  DestinationActivityDto,
  DestinationCategoryDto,
  DestinationDto,
  DestinationHighlightDto,
  DestinationHotelSuggestionDto,
  SaveDestinationActivityDto,
  SaveDestinationHighlightDto,
  SaveDestinationHotelSuggestionDto,
  UpdateDestinationDto,
} from "@paxbook/types";

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: () => apiFetch<DestinationDto[]>("/destinations"),
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ["destinations", "countries"],
    queryFn: () => apiFetch<CountryDto[]>("/destinations/countries"),
    staleTime: Infinity,
  });
}

export function useDestinationCategories() {
  return useQuery({
    queryKey: ["destinations", "categories"],
    queryFn: () => apiFetch<DestinationCategoryDto[]>("/destinations/categories"),
    staleTime: Infinity,
  });
}

export function useCreateDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDestinationDto) => apiFetch<DestinationDto>("/destinations", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useUpdateDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDestinationDto }) =>
      apiFetch<DestinationDto>(`/destinations/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

export function useDeleteDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/destinations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}

// --- Destination content: highlights, activities, hotel suggestions ---

export function useDestinationHighlights(destinationId: string | null) {
  return useQuery({
    queryKey: ["destinations", destinationId, "highlights"],
    queryFn: () => apiFetch<DestinationHighlightDto[]>(`/destinations/${destinationId}/highlights`),
    enabled: Boolean(destinationId),
  });
}

export function useCreateDestinationHighlight(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDestinationHighlightDto) =>
      apiFetch<DestinationHighlightDto>(`/destinations/${destinationId}/highlights`, { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "highlights"] }),
  });
}

export function useDeleteDestinationHighlight(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/destinations/${destinationId}/highlights/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "highlights"] }),
  });
}

export function useDestinationActivities(destinationId: string | null) {
  return useQuery({
    queryKey: ["destinations", destinationId, "activities"],
    queryFn: () => apiFetch<DestinationActivityDto[]>(`/destinations/${destinationId}/activities`),
    enabled: Boolean(destinationId),
  });
}

export function useCreateDestinationActivity(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDestinationActivityDto) =>
      apiFetch<DestinationActivityDto>(`/destinations/${destinationId}/activities`, { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "activities"] }),
  });
}

export function useDeleteDestinationActivity(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/destinations/${destinationId}/activities/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "activities"] }),
  });
}

export function useDestinationHotelSuggestions(destinationId: string | null) {
  return useQuery({
    queryKey: ["destinations", destinationId, "hotel-suggestions"],
    queryFn: () => apiFetch<DestinationHotelSuggestionDto[]>(`/destinations/${destinationId}/hotel-suggestions`),
    enabled: Boolean(destinationId),
  });
}

export function useCreateDestinationHotelSuggestion(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDestinationHotelSuggestionDto) =>
      apiFetch<DestinationHotelSuggestionDto>(`/destinations/${destinationId}/hotel-suggestions`, { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "hotel-suggestions"] }),
  });
}

export function useDeleteDestinationHotelSuggestion(destinationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/destinations/${destinationId}/hotel-suggestions/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations", destinationId, "hotel-suggestions"] }),
  });
}
