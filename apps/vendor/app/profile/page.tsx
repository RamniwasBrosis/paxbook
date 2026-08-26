import type { Metadata } from "next";
import type { VendorProfileDto } from "@paxbook/types";
import { vendorFetch } from "@/lib/vendor-api";
import { VendorProfileForm } from "@/components/VendorProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await vendorFetch<VendorProfileDto>("/vendor/profile");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          {profile.name} · {profile.categoryType} · {profile.email}
        </p>
        <p className="mt-1 text-xs text-slate-400">Name and category are managed by Paxbook — contact your account manager to change them.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Contact info</h2>
        <VendorProfileForm contactInfo={profile.contactInfo} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Change password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
