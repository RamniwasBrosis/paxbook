import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";

export default function RootPage() {
  redirect(readSession() ? "/dashboard" : "/login");
}
