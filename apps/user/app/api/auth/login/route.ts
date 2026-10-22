import { proxyAuthAndEstablishSession } from "@/lib/session";
import { forwardedFor } from "@/lib/client-ip";

export async function POST(req: Request) {
  const payload = await req.json();
  return proxyAuthAndEstablishSession("/customer-auth/login", payload, forwardedFor(req));
}
