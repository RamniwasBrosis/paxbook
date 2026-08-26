import * as React from "react";
import type { AuthenticatedAdminDto } from "@paxbook/types";
import {
  bootstrapSession,
  getCurrentAdmin,
  onSessionChange,
  login as authLogin,
  logout as authLogout,
} from "@paxbook/auth-client";

export interface SessionContextValue {
  admin: AuthenticatedAdminDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthenticatedAdminDto>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

/**
 * Mount once near the app root (inside the QueryClientProvider). Silently
 * establishes a session from the httpOnly refresh cookie on first load, then
 * keeps `admin` in sync with the in-memory token store for every consumer.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<AuthenticatedAdminDto | null>(getCurrentAdmin());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onSessionChange(setAdmin);
    bootstrapSession()
      .then(() => setAdmin(getCurrentAdmin()))
      .finally(() => setIsLoading(false));
    return unsubscribe;
  }, []);

  const value = React.useMemo<SessionContextValue>(
    () => ({
      admin,
      isLoading,
      login: authLogin,
      logout: authLogout,
      hasPermission: (permission: string) => admin?.permissions.includes(permission as never) ?? false,
    }),
    [admin, isLoading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a <SessionProvider>");
  return ctx;
}
