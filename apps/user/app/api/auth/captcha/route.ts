import { proxyPublicAuth } from "@/lib/auth-proxy";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return proxyPublicAuth(req, "/customer-auth/captcha");
}
