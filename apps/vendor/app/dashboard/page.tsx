import Link from "next/link";
import type { Metadata } from "next";
import type { VendorAssignmentDto, VendorContractDto, VendorPaymentDto, VendorProfileDto } from "@paxbook/types";
import { vendorFetch } from "@/lib/vendor-api";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [profile, contracts, payments, assignments] = await Promise.all([
    vendorFetch<VendorProfileDto>("/vendor/profile"),
    vendorFetch<VendorContractDto[]>("/vendor/contracts"),
    vendorFetch<VendorPaymentDto[]>("/vendor/payments"),
    vendorFetch<VendorAssignmentDto[]>("/vendor/assignments"),
  ]);

  const now = new Date();
  const activeContracts = contracts.filter((c) => !c.endDate || new Date(c.endDate) >= now).length;
  const pendingAmount = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {profile.categoryType} vendor · {profile.status === "ACTIVE" ? "Active" : "Inactive"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/contracts" className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand">
          <p className="text-xs text-slate-400">Active contracts</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeContracts}</p>
        </Link>
        <Link href="/payments" className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand">
          <p className="text-xs text-slate-400">Pending payments</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">₹{pendingAmount.toLocaleString("en-IN")}</p>
        </Link>
        <Link href="/assignments" className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand">
          <p className="text-xs text-slate-400">Trip assignments</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{assignments.length}</p>
        </Link>
      </div>

      {!profile.contactInfo ? (
        <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Your contact info isn&apos;t set yet.{" "}
          <Link href="/profile" className="font-semibold underline">
            Add it in your profile
          </Link>{" "}
          so Paxbook can reach you.
        </div>
      ) : null}
    </div>
  );
}
