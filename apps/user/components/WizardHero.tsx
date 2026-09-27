/** Design 2 header for the customize / view-price wizards: cream band, script eyebrow, small arched photo. */
export function WizardHero({ eyebrow, title, imageUrl }: { eyebrow: string; title: string; imageUrl?: string | null }) {
  return (
    <div className="bg-cream">
      <div className="shell flex items-center justify-between gap-8 py-10 sm:py-12">
        <div className="min-w-0">
          <p className="script-eyebrow text-[1.7rem] sm:text-3xl">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight tracking-tight text-navy-deep sm:text-5xl">{title}</h1>
        </div>
        {imageUrl ? (
          <div className="arch hidden h-40 w-32 shrink-0 overflow-hidden rounded-b-2xl border-[6px] border-white shadow-float sm:block">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
