"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  usePackage,
  useCreatePackage,
  useUpdatePackage,
  useDestinations,
  useUploadFile,
  useVendors,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type {
  ItineraryDayDto,
  PackageActivityDto,
  PackageDetailDto,
  PackageFlightDto,
  PackageGalleryImageDto,
  PackageHotelDto,
  PackagePricingTierDto,
  PackageRouteMapPointDto,
  SavePackageDto,
  SeasonalRateDto,
} from "@paxbook/types";
import { Button, Card, CardContent, CardHeader, CardTitle, ImageUploadField, Input, Select } from "@paxbook/ui";

export default function PackageBuilderPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const { hasPermission } = useSession();

  if (!hasPermission(PERMISSIONS.PACKAGES_WRITE)) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>packages.write</code>.</p>
      </Card>
    );
  }

  const canApprove = hasPermission(PERMISSIONS.PACKAGES_APPROVE);
  if (isNew) return <PackageBuilderForm packageId={null} initial={null} canApprove={canApprove} />;
  return <ExistingPackageBuilder id={params.id} canApprove={canApprove} />;
}

function ExistingPackageBuilder({ id, canApprove }: { id: string; canApprove: boolean }) {
  const packageQuery = usePackage(id);
  if (packageQuery.isLoading || !packageQuery.data) {
    return <p className="text-sm text-slate-500">Loading package…</p>;
  }
  return <PackageBuilderForm packageId={id} initial={packageQuery.data} canApprove={canApprove} />;
}

interface FormState {
  title: string;
  slug: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  templateHintSlug: string;
  itineraryDays: ItineraryDayDto[];
  hotels: PackageHotelDto[];
  flights: PackageFlightDto[];
  pricingTiers: PackagePricingTierDto[];
  seasonalRates: SeasonalRateDto[];
  galleryImages: PackageGalleryImageDto[];
  routeMapPoints: PackageRouteMapPointDto[];
  seoTitle: string;
  seoDescription: string;
  seoCanonicalUrl: string;
}

function toFormState(pkg: PackageDetailDto | null): FormState {
  if (!pkg) {
    return {
      title: "",
      slug: "",
      destinationId: "",
      durationDays: 1,
      durationNights: 0,
      basePrice: 0,
      status: "DRAFT",
      templateHintSlug: "",
      itineraryDays: [],
      hotels: [],
      flights: [],
      pricingTiers: [],
      seasonalRates: [],
      galleryImages: [],
      routeMapPoints: [],
      seoTitle: "",
      seoDescription: "",
      seoCanonicalUrl: "",
    };
  }
  return {
    title: pkg.title,
    slug: pkg.slug,
    destinationId: pkg.destinationId,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    basePrice: pkg.basePrice,
    status: pkg.status,
    templateHintSlug: pkg.templateHintSlug ?? "",
    itineraryDays: pkg.itineraryDays,
    hotels: pkg.hotels,
    flights: pkg.flights,
    pricingTiers: pkg.pricingTiers,
    seasonalRates: pkg.seasonalRates,
    galleryImages: pkg.galleryImages,
    routeMapPoints: pkg.routeMapPoints,
    seoTitle: pkg.seo?.title ?? "",
    seoDescription: pkg.seo?.description ?? "",
    seoCanonicalUrl: pkg.seo?.canonicalUrl ?? "",
  };
}

function PackageBuilderForm({
  packageId,
  initial,
  canApprove,
}: {
  packageId: string | null;
  initial: PackageDetailDto | null;
  canApprove: boolean;
}) {
  const router = useRouter();
  const destinationsQuery = useDestinations();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const uploadFile = useUploadFile();

  const [form, setForm] = React.useState<FormState>(() => toFormState(initial));
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: SavePackageDto = {
      title: form.title,
      slug: form.slug,
      destinationId: form.destinationId,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      basePrice: Number(form.basePrice),
      status: form.status,
      templateHintSlug: form.templateHintSlug || undefined,
      itineraryDays: form.itineraryDays,
      hotels: form.hotels,
      flights: form.flights,
      pricingTiers: form.pricingTiers,
      seasonalRates: form.seasonalRates,
      galleryImages: form.galleryImages,
      routeMapPoints: form.routeMapPoints,
      seo: {
        title: form.seoTitle || undefined,
        description: form.seoDescription || undefined,
        canonicalUrl: form.seoCanonicalUrl || undefined,
      },
    };

    try {
      if (packageId) {
        await updatePackage.mutateAsync({ id: packageId, payload });
      } else {
        const created = await createPackage.mutateAsync(payload);
        router.replace(`/packages/${created.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save package.");
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{packageId ? "Edit package" : "New package"}</h1>
          <p className="text-sm text-slate-500">Itinerary, hotels, flights, pricing, and gallery for one package.</p>
        </div>
        <div className="flex items-center gap-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" isLoading={createPackage.isPending || updatePackage.isPending}>
            Save package
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <Select
            label="Destination"
            required
            value={form.destinationId}
            onChange={(e) => setForm((f) => ({ ...f, destinationId: e.target.value }))}
          >
            <option value="" disabled>
              Select a destination…
            </option>
            {destinationsQuery.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <div>
            <Select
              label="Status"
              value={form.status}
              disabled={!canApprove && initial?.status === "PUBLISHED"}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" }))}
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Submit for review</option>
              {canApprove ? <option value="PUBLISHED">Published</option> : null}
            </Select>
            {!canApprove && initial?.status === "PUBLISHED" ? (
              <p className="mt-1 text-xs text-slate-400">Only a Super Admin can change a published package&apos;s status.</p>
            ) : null}
          </div>
          <Input
            label="Duration (days)"
            type="number"
            min={1}
            required
            value={form.durationDays}
            onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
          />
          <Input
            label="Duration (nights)"
            type="number"
            min={0}
            required
            value={form.durationNights}
            onChange={(e) => setForm((f) => ({ ...f, durationNights: Number(e.target.value) }))}
          />
          <Input
            label="Base price (₹)"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.basePrice}
            onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
          />
          <Input
            label="Template hint (optional)"
            placeholder="e.g. adventure-01"
            value={form.templateHintSlug}
            onChange={(e) => setForm((f) => ({ ...f, templateHintSlug: e.target.value }))}
          />
        </CardContent>
      </Card>

      <ItinerarySection form={form} setForm={setForm} uploadFile={uploadFile} />
      <HotelsSection form={form} setForm={setForm} uploadFile={uploadFile} />
      <FlightsSection form={form} setForm={setForm} />
      <PricingSection form={form} setForm={setForm} />
      <SeasonalRatesSection form={form} setForm={setForm} />
      <GallerySection form={form} setForm={setForm} uploadFile={uploadFile} />
      <RouteMapSection form={form} setForm={setForm} />

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Meta title" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
          <Input
            label="Canonical URL"
            value={form.seoCanonicalUrl}
            onChange={(e) => setForm((f) => ({ ...f, seoCanonicalUrl: e.target.value }))}
          />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Meta description</label>
            <textarea
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={2}
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

type SetForm = React.Dispatch<React.SetStateAction<FormState>>;

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"];

function ItinerarySection({
  form,
  setForm,
  uploadFile,
}: {
  form: FormState;
  setForm: SetForm;
  uploadFile: ReturnType<typeof useUploadFile>;
}) {
  const activityVendorsQuery = useVendors("ACTIVITY");
  const [uploadingDayImage, setUploadingDayImage] = React.useState<number | null>(null);
  const [uploadingActivityImage, setUploadingActivityImage] = React.useState<string | null>(null);

  function addDay() {
    setForm((f) => ({
      ...f,
      itineraryDays: [
        ...f.itineraryDays,
        { dayNumber: f.itineraryDays.length + 1, title: "", description: "", activities: [], location: "", mealsIncluded: [], notes: "" },
      ],
    }));
  }
  function updateDay(index: number, patch: Partial<ItineraryDayDto>) {
    setForm((f) => ({ ...f, itineraryDays: f.itineraryDays.map((d, i) => (i === index ? { ...d, ...patch } : d)) }));
  }
  function removeDay(index: number) {
    setForm((f) => ({ ...f, itineraryDays: f.itineraryDays.filter((_, i) => i !== index) }));
  }
  function toggleMeal(dayIndex: number, meal: string) {
    const day = form.itineraryDays[dayIndex];
    if (!day) return;
    const meals = day.mealsIncluded ?? [];
    updateDay(dayIndex, { mealsIncluded: meals.includes(meal) ? meals.filter((m) => m !== meal) : [...meals, meal] });
  }
  async function handleDayImage(dayIndex: number, file: File) {
    setUploadingDayImage(dayIndex);
    try {
      const result = await uploadFile.mutateAsync(file);
      updateDay(dayIndex, { imageStorageKey: result.key, imageUrl: result.url });
    } finally {
      setUploadingDayImage(null);
    }
  }
  function addActivity(dayIndex: number) {
    const day = form.itineraryDays[dayIndex];
    if (!day) return;
    updateDay(dayIndex, { activities: [...(day.activities ?? []), { name: "", description: "", isOptional: false }] });
  }
  function updateActivity(dayIndex: number, actIndex: number, patch: Partial<PackageActivityDto>) {
    const day = form.itineraryDays[dayIndex];
    const existing = day?.activities?.[actIndex];
    if (!day || !existing) return;
    const activities = [...(day.activities ?? [])];
    activities[actIndex] = { ...existing, ...patch };
    updateDay(dayIndex, { activities });
  }
  async function handleActivityImage(dayIndex: number, actIndex: number, file: File) {
    const key = `${dayIndex}-${actIndex}`;
    setUploadingActivityImage(key);
    try {
      const result = await uploadFile.mutateAsync(file);
      updateActivity(dayIndex, actIndex, { imageStorageKey: result.key, imageUrl: result.url });
    } finally {
      setUploadingActivityImage(null);
    }
  }
  function removeActivity(dayIndex: number, actIndex: number) {
    const day = form.itineraryDays[dayIndex];
    if (!day) return;
    updateDay(dayIndex, { activities: (day.activities ?? []).filter((_, i) => i !== actIndex) });
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Day-wise itinerary</CardTitle>
        <Button type="button" variant="secondary" onClick={addDay}>
          Add day
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {form.itineraryDays.map((day, dayIndex) => (
          <div key={dayIndex} className="rounded-md border border-slate-200 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[100px_1fr_auto]">
              <Input
                label="Day #"
                type="number"
                min={1}
                value={day.dayNumber}
                onChange={(e) => updateDay(dayIndex, { dayNumber: Number(e.target.value) })}
              />
              <Input label="Title" value={day.title} onChange={(e) => updateDay(dayIndex, { title: e.target.value })} />
              <button type="button" onClick={() => removeDay(dayIndex)} className="self-end pb-2 text-xs text-red-600 hover:underline">
                Remove day
              </button>
            </div>
            <div className="mt-3">
              <Input
                label="Location / destination for this day"
                placeholder="e.g. Ubud, Bali"
                value={day.location ?? ""}
                onChange={(e) => updateDay(dayIndex, { location: e.target.value })}
              />
            </div>
            <textarea
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={2}
              placeholder="Description"
              value={day.description ?? ""}
              onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
            />

            <div className="mt-3 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Meals included</span>
              <div className="flex flex-wrap gap-3">
                {MEAL_OPTIONS.map((meal) => (
                  <label key={meal} className="flex items-center gap-1.5 text-sm text-slate-600">
                    <input type="checkbox" checked={(day.mealsIncluded ?? []).includes(meal)} onChange={() => toggleMeal(dayIndex, meal)} />
                    {meal}
                  </label>
                ))}
              </div>
            </div>

            <textarea
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={2}
              placeholder="Additional notes / instructions for this day"
              value={day.notes ?? ""}
              onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
            />

            <div className="mt-3">
              <ImageUploadField
                label="Day image"
                imageUrl={day.imageUrl}
                isUploading={uploadingDayImage === dayIndex}
                onFileSelected={(file) => handleDayImage(dayIndex, file)}
                onClear={() => updateDay(dayIndex, { imageStorageKey: undefined, imageUrl: undefined })}
              />
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Activities</span>
                <button type="button" onClick={() => addActivity(dayIndex)} className="text-xs text-slate-600 hover:underline">
                  + Add activity
                </button>
              </div>
              {(day.activities ?? []).map((activity, actIndex) => (
                <div key={actIndex} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-100 p-2">
                  <input
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Activity name"
                    value={activity.name}
                    onChange={(e) => updateActivity(dayIndex, actIndex, { name: e.target.value })}
                  />
                  <input
                    className="w-40 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Timing, e.g. 9:00 AM - 12:00 PM"
                    value={activity.timeLabel ?? ""}
                    onChange={(e) => updateActivity(dayIndex, actIndex, { timeLabel: e.target.value })}
                  />
                  <select
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                    value={activity.activityVendorId ?? ""}
                    onChange={(e) => updateActivity(dayIndex, actIndex, { activityVendorId: e.target.value })}
                  >
                    <option value="">No vendor</option>
                    {activityVendorsQuery.data?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={activity.isOptional ?? false}
                      onChange={(e) => updateActivity(dayIndex, actIndex, { isOptional: e.target.checked })}
                    />
                    Optional
                  </label>
                  <ImageUploadField
                    imageUrl={activity.imageUrl}
                    isUploading={uploadingActivityImage === `${dayIndex}-${actIndex}`}
                    onFileSelected={(file) => handleActivityImage(dayIndex, actIndex, file)}
                    onClear={() => updateActivity(dayIndex, actIndex, { imageStorageKey: undefined, imageUrl: undefined })}
                  />
                  <button type="button" onClick={() => removeActivity(dayIndex, actIndex)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {form.itineraryDays.length === 0 ? <p className="text-sm text-slate-400">No itinerary days yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function HotelsSection({
  form,
  setForm,
  uploadFile,
}: {
  form: FormState;
  setForm: SetForm;
  uploadFile: ReturnType<typeof useUploadFile>;
}) {
  const hotelVendorsQuery = useVendors("HOTEL");
  const [uploadingHotelImage, setUploadingHotelImage] = React.useState<number | null>(null);

  function add() {
    setForm((f) => ({ ...f, hotels: [...f.hotels, { cityName: "", checkInDay: 1, checkOutDay: 2 }] }));
  }
  function update(index: number, patch: Partial<PackageHotelDto>) {
    setForm((f) => ({ ...f, hotels: f.hotels.map((h, i) => (i === index ? { ...h, ...patch } : h)) }));
  }
  function remove(index: number) {
    setForm((f) => ({ ...f, hotels: f.hotels.filter((_, i) => i !== index) }));
  }
  async function handleHotelImage(index: number, file: File) {
    setUploadingHotelImage(index);
    try {
      const result = await uploadFile.mutateAsync(file);
      update(index, { imageStorageKey: result.key, imageUrl: result.url });
    } finally {
      setUploadingHotelImage(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Hotels</CardTitle>
        <Button type="button" variant="secondary" onClick={add}>
          Add hotel
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {form.hotels.map((hotel, index) => (
          <div key={index} className="rounded-md border border-slate-200 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            <input
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="City"
              value={hotel.cityName}
              onChange={(e) => update(index, { cityName: e.target.value })}
            />
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={hotel.hotelVendorId ?? ""}
              onChange={(e) => update(index, { hotelVendorId: e.target.value || undefined })}
            >
              <option value="">No vendor</option>
              {hotelVendorsQuery.data?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Room type"
              value={hotel.roomType ?? ""}
              onChange={(e) => update(index, { roomType: e.target.value })}
            />
            <input
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Meal plan"
              value={hotel.mealPlan ?? ""}
              onChange={(e) => update(index, { mealPlan: e.target.value })}
            />
            <input
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              type="number"
              placeholder="Check-in day"
              value={hotel.checkInDay}
              onChange={(e) => update(index, { checkInDay: Number(e.target.value) })}
            />
            <div className="flex items-center gap-2">
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                type="number"
                placeholder="Check-out day"
                value={hotel.checkOutDay}
                onChange={(e) => update(index, { checkOutDay: Number(e.target.value) })}
              />
              <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 hover:underline">
                ✕
              </button>
            </div>
          </div>
          <div className="mt-2">
            <ImageUploadField
              label="Hotel image"
              imageUrl={hotel.imageUrl}
              isUploading={uploadingHotelImage === index}
              onFileSelected={(file) => handleHotelImage(index, file)}
              onClear={() => update(index, { imageStorageKey: undefined, imageUrl: undefined })}
            />
          </div>
          </div>
        ))}
        {form.hotels.length === 0 ? <p className="text-sm text-slate-400">No hotels yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function FlightsSection({ form, setForm }: { form: FormState; setForm: SetForm }) {
  function add() {
    setForm((f) => ({ ...f, flights: [...f.flights, { sector: "", isIncluded: true }] }));
  }
  function update(index: number, patch: Partial<PackageFlightDto>) {
    setForm((f) => ({ ...f, flights: f.flights.map((fl, i) => (i === index ? { ...fl, ...patch } : fl)) }));
  }
  function remove(index: number) {
    setForm((f) => ({ ...f, flights: f.flights.filter((_, i) => i !== index) }));
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Flights</CardTitle>
        <Button type="button" variant="secondary" onClick={add}>
          Add flight
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {form.flights.map((flight, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-3">
            <input
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Sector (e.g. DEL-BKK)"
              value={flight.sector}
              onChange={(e) => update(index, { sector: e.target.value })}
            />
            <input
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Carrier"
              value={flight.carrierName ?? ""}
              onChange={(e) => update(index, { carrierName: e.target.value })}
            />
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={flight.isIncluded ?? true} onChange={(e) => update(index, { isIncluded: e.target.checked })} />
              Included
            </label>
            <div className="flex flex-col gap-0.5">
              <input
                className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                type="number"
                min={1}
                placeholder="Day #"
                value={flight.dayNumber ?? ""}
                onChange={(e) => update(index, { dayNumber: e.target.value ? Number(e.target.value) : undefined })}
              />
              <span className="text-[10px] text-slate-400">Leave blank if not tied to a specific day</span>
            </div>
            <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {form.flights.length === 0 ? <p className="text-sm text-slate-400">No flights yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function PricingSection({ form, setForm }: { form: FormState; setForm: SetForm }) {
  function add() {
    setForm((f) => ({ ...f, pricingTiers: [...f.pricingTiers, { name: "", basePrice: 0, currency: "INR" }] }));
  }
  function update(index: number, patch: Partial<PackagePricingTierDto>) {
    setForm((f) => ({ ...f, pricingTiers: f.pricingTiers.map((t, i) => (i === index ? { ...t, ...patch } : t)) }));
  }
  function remove(index: number) {
    setForm((f) => ({ ...f, pricingTiers: f.pricingTiers.filter((_, i) => i !== index) }));
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Pricing tiers</CardTitle>
        <Button type="button" variant="secondary" onClick={add}>
          Add tier
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {form.pricingTiers.map((tier, index) => (
          <div key={index} className="flex items-center gap-2 rounded-md border border-slate-200 p-3">
            <input
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Tier name (e.g. Standard)"
              value={tier.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <input
              className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              type="number"
              placeholder="Price"
              value={tier.basePrice}
              onChange={(e) => update(index, { basePrice: Number(e.target.value) })}
            />
            <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {form.pricingTiers.length === 0 ? <p className="text-sm text-slate-400">No pricing tiers yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function SeasonalRatesSection({ form, setForm }: { form: FormState; setForm: SetForm }) {
  function add() {
    setForm((f) => ({
      ...f,
      seasonalRates: [
        ...f.seasonalRates,
        { startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), priceModifierType: "PERCENT", value: 0 },
      ],
    }));
  }
  function update(index: number, patch: Partial<SeasonalRateDto>) {
    setForm((f) => ({ ...f, seasonalRates: f.seasonalRates.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  }
  function remove(index: number) {
    setForm((f) => ({ ...f, seasonalRates: f.seasonalRates.filter((_, i) => i !== index) }));
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Seasonal rates</CardTitle>
        <Button type="button" variant="secondary" onClick={add}>
          Add rate
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {form.seasonalRates.map((rate, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-5">
            <input
              type="date"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={rate.startDate.slice(0, 10)}
              onChange={(e) => update(index, { startDate: e.target.value })}
            />
            <input
              type="date"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={rate.endDate.slice(0, 10)}
              onChange={(e) => update(index, { endDate: e.target.value })}
            />
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={rate.priceModifierType}
              onChange={(e) => update(index, { priceModifierType: e.target.value as "FIXED" | "PERCENT" })}
            >
              <option value="PERCENT">Percent</option>
              <option value="FIXED">Fixed</option>
            </select>
            <input
              type="number"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Value"
              value={rate.value}
              onChange={(e) => update(index, { value: Number(e.target.value) })}
            />
            <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {form.seasonalRates.length === 0 ? <p className="text-sm text-slate-400">No seasonal rates yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function GallerySection({
  form,
  setForm,
  uploadFile,
}: {
  form: FormState;
  setForm: SetForm;
  uploadFile: ReturnType<typeof useUploadFile>;
}) {
  const [isUploading, setIsUploading] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFile.mutateAsync(file);
        setForm((f) => ({
          ...f,
          galleryImages: [...f.galleryImages, { storageKey: result.key, imageUrl: result.url, sortOrder: f.galleryImages.length }],
        }));
      }
    } finally {
      setIsUploading(false);
    }
  }

  function remove(index: number) {
    setForm((f) => ({ ...f, galleryImages: f.galleryImages.filter((_, i) => i !== index) }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="text-xs text-slate-500 file:mr-2 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700"
        />
        {isUploading ? <p className="text-xs text-slate-400">Uploading…</p> : null}
        <div className="flex flex-wrap gap-3">
          {form.galleryImages.map((image, index) => (
            <div key={index} className="relative">
              <img src={image.imageUrl} alt="" className="h-20 w-20 rounded-md border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RouteMapSection({ form, setForm }: { form: FormState; setForm: SetForm }) {
  function add() {
    setForm((f) => ({ ...f, routeMapPoints: [...f.routeMapPoints, { lat: 0, lng: 0, sortOrder: f.routeMapPoints.length }] }));
  }
  function update(index: number, patch: Partial<PackageRouteMapPointDto>) {
    setForm((f) => ({ ...f, routeMapPoints: f.routeMapPoints.map((p, i) => (i === index ? { ...p, ...patch } : p)) }));
  }
  function remove(index: number) {
    setForm((f) => ({ ...f, routeMapPoints: f.routeMapPoints.filter((_, i) => i !== index) }));
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Route map points</CardTitle>
        <Button type="button" variant="secondary" onClick={add}>
          Add point
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {form.routeMapPoints.map((point, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-4">
            <input
              type="number"
              step="any"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Latitude"
              value={point.lat}
              onChange={(e) => update(index, { lat: Number(e.target.value) })}
            />
            <input
              type="number"
              step="any"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Longitude"
              value={point.lng}
              onChange={(e) => update(index, { lng: Number(e.target.value) })}
            />
            <input
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Label"
              value={point.label ?? ""}
              onChange={(e) => update(index, { label: e.target.value })}
            />
            <button type="button" onClick={() => remove(index)} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {form.routeMapPoints.length === 0 ? <p className="text-sm text-slate-400">No route map points yet.</p> : null}
      </CardContent>
    </Card>
  );
}
