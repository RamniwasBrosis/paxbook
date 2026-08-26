export type TenantStatus = "ACTIVE" | "TRIAL" | "SUSPENDED";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

export interface PlanDto {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  maxAdminUsers: number | null;
  maxPackages: number | null;
  isActive: boolean;
  razorpayPlanId: string | null;
}

export interface SavePlanDto {
  name: string;
  priceMonthly: number;
  currency?: string;
  maxAdminUsers?: number;
  maxPackages?: number;
  isActive?: boolean;
  razorpayPlanId?: string;
}

export interface TenantSummaryDto {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  templateSlug: string;
  customDomain: string | null;
  createdAt: string;
  planName: string | null;
  subscriptionStatus: SubscriptionStatus | null;
}

export interface UpdateTenantStatusDto {
  status: "ACTIVE" | "SUSPENDED";
}

export interface SignupTenantDto {
  agencyName: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  planId: string;
}
