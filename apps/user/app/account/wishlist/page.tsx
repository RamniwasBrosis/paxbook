import Link from "next/link";
import type { Metadata } from "next";
import type { WishlistItemDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";
import { WishlistRemoveButton } from "@/components/WishlistRemoveButton";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const items = await customerFetch<WishlistItemDto[]>("/customer/wishlist");

  return (
    <div>
      <p className="eyebrow">Saved for later</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">Packages you&apos;ve saved for later.</p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">
          Nothing saved yet. <Link href="/packages" className="font-semibold text-brand hover:underline">Browse packages</Link> and tap the heart icon to save one.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="flat-card overflow-hidden">
              {item.packageCoverImageUrl ? (
                <img src={item.packageCoverImageUrl} alt={item.packageTitle} className="h-32 w-full object-cover" />
              ) : null}
              <div className="p-4">
                <Link href={`/packages/${item.packageSlug}`} className="font-bold text-navy-deep hover:text-brand">
                  {item.packageTitle}
                </Link>
                <p className="mt-1 text-sm font-semibold text-brand">₹{item.basePrice.toLocaleString("en-IN")}</p>
                <div className="mt-3">
                  <WishlistRemoveButton packageId={item.packageId} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
