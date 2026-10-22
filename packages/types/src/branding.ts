export type TemplateSlug = "classic" | "modern";

export interface TenantBrandingDto {
  siteName: string;
  logoStorageKey: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  templateSlug: TemplateSlug;
  slug: string;
  customDomain: string | null;
  /** Shows the AI Trip Planner on the public site. */
  aiPlannerEnabled: boolean;
  heroVideoKey: string | null;
  heroVideoUrl: string | null;
}

export interface UpdateTenantBrandingDto {
  logoStorageKey?: string;
  primaryColor?: string;
  templateSlug?: TemplateSlug;
  customDomain?: string;
  aiPlannerEnabled?: boolean;
  /** "" resets to the built-in video. */
  heroVideoKey?: string;
}

export interface PublicBrandingDto {
  siteName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  templateSlug: TemplateSlug;
  googleLoginEnabled: boolean;
  aiPlannerEnabled: boolean;
  /** Homepage hero video; null = the built-in one. */
  heroVideoUrl: string | null;
  ga4MeasurementId: string | null;
  facebookPixelId: string | null;
  googleMapsApiKey: string | null;
}
