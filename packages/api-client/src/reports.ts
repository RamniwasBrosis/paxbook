import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  ConsultantPerformanceDto,
  MarketingReportDto,
  RevenueReportDto,
  SalesReportDto,
  SatisfactionReportDto,
} from "@paxbook/types";

export function useSalesReport() {
  return useQuery({ queryKey: ["reports", "sales"], queryFn: () => apiFetch<SalesReportDto>("/reports/sales") });
}

export function useRevenueReport() {
  return useQuery({ queryKey: ["reports", "revenue"], queryFn: () => apiFetch<RevenueReportDto>("/reports/revenue") });
}

export function useConsultantPerformanceReport() {
  return useQuery({ queryKey: ["reports", "consultants"], queryFn: () => apiFetch<ConsultantPerformanceDto[]>("/reports/consultants") });
}

export function useMarketingReport() {
  return useQuery({ queryKey: ["reports", "marketing"], queryFn: () => apiFetch<MarketingReportDto>("/reports/marketing") });
}

export function useSatisfactionReport() {
  return useQuery({ queryKey: ["reports", "satisfaction"], queryFn: () => apiFetch<SatisfactionReportDto>("/reports/satisfaction") });
}
