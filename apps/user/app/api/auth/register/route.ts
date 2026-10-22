import { proxyPublicAuth } from "@/lib/auth-proxy";

/**
 * Signup step 1. No session is created at any point of signup: the customer verifies the email code
 * (register/verify) and then logs in explicitly.
 */
export function POST(req: Request) {
  return proxyPublicAuth(req, "/customer-auth/register/start");
}
