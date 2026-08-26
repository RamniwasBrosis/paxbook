import type { ApiResponse, ApiSuccess, LoginResponseDto, RefreshResponseDto, SignupTenantDto } from "@paxbook/types";
import { getAccessToken, isAccessTokenExpired, clearSession, setSession } from "./token-store";

let baseUrl = "http://localhost:4000/api/v1";
let refreshInFlight: Promise<boolean> | null = null;

export function configureAuthClient(options: { baseUrl: string }) {
  baseUrl = options.baseUrl.replace(/\/$/, "");
}

export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const body = (await res.json()) as ApiResponse<RefreshResponseDto>;
      if (!body.success) {
        clearSession();
        return false;
      }
      setSession(body.data.accessToken, body.data.accessTokenExpiresAt, body.data.admin);
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Called once on app boot to silently establish a session from the refresh cookie. */
export async function bootstrapSession(): Promise<boolean> {
  return refreshAccessToken();
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuthRefresh?: boolean;
}

async function performRequest<T>(path: string, options: ApiFetchOptions): Promise<ApiSuccess<T>> {
  const { body, skipAuthRefresh, headers, ...rest } = options;

  if (!skipAuthRefresh && getAccessToken() && isAccessTokenExpired()) {
    await refreshAccessToken();
  }

  const doFetch = async () =>
    fetch(`${baseUrl}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    }
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!json) {
    throw new ApiRequestError("UNKNOWN_ERROR", `Request failed with status ${res.status}`, res.status);
  }

  if (!json.success) {
    throw new ApiRequestError(json.error.code, json.error.message, res.status, json.error.details);
  }

  return json;
}

/** For endpoints returning a single resource — resolves to the unwrapped `data`. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const json = await performRequest<T>(path, options);
  return json.data;
}

/** For paginated list endpoints — resolves to both `data` and pagination `meta`. */
export async function apiFetchPaginated<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ data: T; meta: { page: number; pageSize: number; total: number } }> {
  const json = await performRequest<T>(path, options);
  return { data: json.data, meta: json.meta ?? { page: 1, pageSize: 0, total: 0 } };
}

export async function login(email: string, password: string) {
  const data = await apiFetch<LoginResponseDto>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuthRefresh: true,
  });
  setSession(data.accessToken, data.accessTokenExpiresAt, data.admin);
  return data.admin;
}

export async function signupTenant(payload: SignupTenantDto) {
  const data = await apiFetch<LoginResponseDto>("/platform/tenants/signup", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  });
  setSession(data.accessToken, data.accessTokenExpiresAt, data.admin);
  return data.admin;
}

/** Multipart upload — separate from apiFetch since it can't JSON.stringify a File body. */
export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : undefined,
    body: formData,
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!json) {
    throw new ApiRequestError("UNKNOWN_ERROR", `Upload failed with status ${res.status}`, res.status);
  }
  if (!json.success) {
    throw new ApiRequestError(json.error.code, json.error.message, res.status, json.error.details);
  }
  return json.data;
}

export async function logout() {
  await apiFetch<void>("/auth/logout", { method: "POST", skipAuthRefresh: true }).catch(() => undefined);
  clearSession();
}
