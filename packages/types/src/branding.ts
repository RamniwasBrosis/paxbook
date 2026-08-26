export type TemplateSlug = "classic" | "modern";

export interface TenantBrandingDto {
  siteName: string;
  logoStorageKey: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  templateSlug: TemplateSlug;
  slug: string;
  customDomain: string | null;
}

export interface UpdateTenantBrandingDto {
  logoStorageKey?: string;
  primaryColor?: string;
  templateSlug?: TemplateSlug;
  customDomain?: string;
}

export interface PublicBrandingDto {
  siteName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  templateSlug: TemplateSlug;
  googleLoginEnabled: boolean;
  ga4MeasurementId: string | null;
  facebookPixelId: string | null;
  googleMapsApiKey: string | null;
}
