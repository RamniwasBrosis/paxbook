export const DEFAULT_ROLE_NAMES = [
  "SuperAdmin",
  "OpsManager",
  "ContentEditor",
  "Consultant",
  "FinanceOfficer",
] as const;

export type DefaultRoleName = (typeof DEFAULT_ROLE_NAMES)[number];

export const DEFAULT_TENANT_SLUG = "default";
