import { PERMISSIONS, type PermissionKey } from "@paxbook/config";

export interface NavItem {
  href: string;
  label: string;
  /** If set, the item is hidden unless the current admin holds this permission. */
  permission?: PermissionKey;
  /** Checkpoint this section ships in — used to render an honest "coming soon" placeholder until then. */
  checkpoint?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/cms", label: "CMS", permission: PERMISSIONS.CMS_READ },
  { href: "/categories", label: "Categories", permission: PERMISSIONS.CATEGORIES_READ },
  { href: "/destinations", label: "Destinations", permission: PERMISSIONS.DESTINATIONS_READ },
  { href: "/packages", label: "Packages", permission: PERMISSIONS.PACKAGES_READ },
  { href: "/testimonials", label: "Testimonials", permission: PERMISSIONS.TESTIMONIALS_READ },
  { href: "/reviews", label: "Reviews", permission: PERMISSIONS.REVIEWS_READ },
  { href: "/offers", label: "Offers & Coupons", permission: PERMISSIONS.OFFERS_READ },
  { href: "/customers", label: "Customers", permission: PERMISSIONS.CUSTOMERS_READ },
  { href: "/bookings", label: "Bookings", permission: PERMISSIONS.BOOKINGS_READ },
  { href: "/crm", label: "CRM", permission: PERMISSIONS.CRM_READ },
  { href: "/finance", label: "Finance", permission: PERMISSIONS.FINANCE_READ },
  { href: "/inventory", label: "Inventory", permission: PERMISSIONS.VENDORS_READ },
  { href: "/reports", label: "Reports", permission: PERMISSIONS.REPORTS_READ },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { href: "/settings/users", label: "Admin Users", permission: PERMISSIONS.USERS_READ },
  { href: "/settings/roles", label: "Roles & Permissions", permission: PERMISSIONS.USERS_READ },
  { href: "/settings/branding", label: "Branding & Template", permission: PERMISSIONS.SETTINGS_READ },
  { href: "/settings/integrations", label: "Integrations", permission: PERMISSIONS.SETTINGS_READ },
  { href: "/settings/backups", label: "Backups", permission: PERMISSIONS.SETTINGS_READ },
  { href: "/settings/billing", label: "Billing", permission: PERMISSIONS.SETTINGS_READ },
  { href: "/settings/audit-log", label: "Audit Log", permission: PERMISSIONS.AUDIT_LOG_READ },
];

/** Only rendered when the current admin has isPlatformOwner: true — sits above any single tenant's RBAC. */
export const PLATFORM_NAV_ITEMS: NavItem[] = [
  { href: "/platform/tenants", label: "Tenants" },
  { href: "/platform/plans", label: "Plans" },
];
