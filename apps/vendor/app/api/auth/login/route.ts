import { proxyAuthAndEstablishSession } from "@/lib/session";

export async function POST(req: Request) {
  const payload = await req.json();
  return proxyAuthAndEstablishSession("/vendor-auth/login", payload);
}
