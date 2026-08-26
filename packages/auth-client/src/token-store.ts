import type { AuthenticatedAdminDto } from "@paxbook/types";

/**
 * Access token lives in memory only (never localStorage) to keep it out of
 * reach of XSS-readable storage. The refresh token is an httpOnly cookie set
 * by the API, so a page reload triggers a silent refresh (see http-client.ts)
 * rather than reading a persisted access token.
 */
let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let currentAdmin: AuthenticatedAdminDto | null = null;

type Listener = (admin: AuthenticatedAdminDto | null) => void;
const listeners = new Set<Listener>();

export function setSession(token: string, expiresAtIso: string, admin: AuthenticatedAdminDto) {
  accessToken = token;
  accessTokenExpiresAt = new Date(expiresAtIso).getTime();
  currentAdmin = admin;
  listeners.forEach((l) => l(currentAdmin));
}

export function setAccessToken(token: string, expiresAtIso: string) {
  accessToken = token;
  accessTokenExpiresAt = new Date(expiresAtIso).getTime();
}

export function clearSession() {
  accessToken = null;
  accessTokenExpiresAt = null;
  currentAdmin = null;
  listeners.forEach((l) => l(null));
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function isAccessTokenExpired(): boolean {
  if (!accessTokenExpiresAt) return true;
  // Treat as expired 10s before actual expiry to avoid racing a request against it.
  return Date.now() > accessTokenExpiresAt - 10_000;
}

export function getCurrentAdmin(): AuthenticatedAdminDto | null {
  return currentAdmin;
}

export function onSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasPermission(permission: string): boolean {
  return currentAdmin?.permissions.includes(permission as never) ?? false;
}
