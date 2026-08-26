/**
 * Canonical permission-key catalog shared by the API (RBAC guards, seed script)
 * and every frontend (client-side <Can/> checks). Keep this the single source
 * of truth — the seed script and the guards both import from here so a typo
 * can't silently create a permission that nothing checks, or vice versa.
 */
export const PERMISSIONS = {
  CMS_READ: "cms.read",
  CMS_WRITE: "cms.write",
  DESTINATIONS_READ: "destinations.read",
  DESTINATIONS_WRITE: "destinations.write",
  PACKAGES_READ: "packages.read",
  PACKAGES_WRITE: "packages.write",
  PACKAGES_APPROVE: "packages.approve",
  TESTIMONIALS_READ: "testimonials.read",
  TESTIMONIALS_WRITE: "testimonials.write",
  TESTIMONIALS_APPROVE: "testimonials.approve",
  REVIEWS_READ: "reviews.read",
  REVIEWS_WRITE: "reviews.write",
  OFFERS_READ: "offers.read",
  OFFERS_WRITE: "offers.write",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_WRITE: "customers.write",
  CRM_READ: "crm.read",
  CRM_WRITE: "crm.write",
  BOOKINGS_READ: "bookings.read",
  BOOKINGS_WRITE: "bookings.write",
  VENDORS_READ: "vendors.read",
  VENDORS_WRITE: "vendors.write",
  FINANCE_READ: "finance.read",
  FINANCE_WRITE: "finance.write",
  REPORTS_READ: "reports.read",
  SETTINGS_READ: "settings.read",
  SETTINGS_WRITE: "settings.write",
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  ROLES_WRITE: "roles.write",
  AUDIT_LOG_READ: "audit_log.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS: PermissionKey[] = Object.values(PERMISSIONS);

/** Default role -> permission matrix used by the Prisma seed script. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SuperAdmin: ALL_PERMISSION_KEYS,
  OpsManager: [
    PERMISSIONS.DESTINATIONS_READ,
    PERMISSIONS.PACKAGES_READ,
    PERMISSIONS.PACKAGES_WRITE,
    PERMISSIONS.REVIEWS_READ,
    PERMISSIONS.REVIEWS_WRITE,
    PERMISSIONS.OFFERS_READ,
    PERMISSIONS.OFFERS_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CRM_WRITE,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.BOOKINGS_WRITE,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.VENDORS_WRITE,
    PERMISSIONS.REPORTS_READ,
  ],
  ContentEditor: [
    PERMISSIONS.CMS_READ,
    PERMISSIONS.CMS_WRITE,
    PERMISSIONS.DESTINATIONS_READ,
    PERMISSIONS.DESTINATIONS_WRITE,
    PERMISSIONS.PACKAGES_READ,
    PERMISSIONS.PACKAGES_WRITE,
    PERMISSIONS.TESTIMONIALS_READ,
    PERMISSIONS.TESTIMONIALS_WRITE,
    PERMISSIONS.REVIEWS_READ,
    PERMISSIONS.REVIEWS_WRITE,
  ],
  Consultant: [
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CRM_WRITE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.PACKAGES_READ,
    PERMISSIONS.DESTINATIONS_READ,
  ],
  FinanceOfficer: [
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.REPORTS_READ,
  ],
};
