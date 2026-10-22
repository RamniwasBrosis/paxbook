import { proxyPublicAuth } from "@/lib/auth-proxy";

export function POST(req: Request) {
  return proxyPublicAuth(req, "/customer-auth/register/resend");
}
