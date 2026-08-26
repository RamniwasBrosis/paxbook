import type { Metadata } from "next";
import type { CustomerDetailDto, CustomerProfileDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";
import { ProfileForm } from "@/components/ProfileForm";
import { AddTravelerForm } from "@/components/AddTravelerForm";
import { DocumentsSection } from "@/components/DocumentsSection";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [profile, full] = await Promise.all([
    customerFetch<CustomerProfileDto>("/customer/profile"),
    customerFetch<CustomerDetailDto>("/customer/profile/full"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Account settings</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your contact details and traveler profiles.</p>
      </div>

      <section className="flat-card max-w-lg p-6">
        <h2 className="mb-4 font-display text-base text-navy-deep">Contact details</h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="flat-card max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-navy-deep">Travelers</h2>
          <AddTravelerForm />
        </div>
        {full.travelers.length === 0 ? (
          <p className="text-sm text-slate-500">No travelers saved yet — add one so it&apos;s ready when you book.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {full.travelers.map((t) => (
              <li key={t.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <p className="font-medium text-slate-900">{t.name}</p>
                <p className="text-slate-500">
                  {t.nationality ?? "Nationality not set"} {t.passportNumber ? `· Passport ${t.passportNumber}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DocumentsSection documents={full.documents} travelers={full.travelers.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
