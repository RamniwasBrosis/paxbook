import type { ReactNode } from "react";
import { ShieldCheck, Headset, Lock } from "lucide-react";

/**
 * Design 2 frame for login / register / password pages: cream band, arched travel photo with the
 * handwritten tagline on the left (desktop only), the form in a white card on the right.
 */
export function AuthShell({ children, notice }: { children: ReactNode; notice?: ReactNode }) {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_28rem] lg:px-8">
        <div className="hidden lg:block">
          <p className="script-eyebrow text-4xl">Happy Traveler, Happy Memories</p>
          <h2 className="mt-3 max-w-md font-display text-4xl font-extrabold leading-tight tracking-tight text-navy-deep">
            Your trips, prices and bookings in <span className="text-gradient">one place.</span>
          </h2>
          <ul className="mt-6 space-y-3 text-[0.95rem] font-semibold text-navy-deep">
            <li className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-brand-blue" strokeWidth={2} /> Unlock package prices and saved itineraries
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" strokeWidth={2} /> Track bookings, vouchers and e-tickets
            </li>
            <li className="flex items-center gap-3">
              <Headset className="h-5 w-5 text-violet-600" strokeWidth={2} /> Your travel expert, one tap away
            </li>
          </ul>
          <div className="arch mt-8 h-64 w-56 overflow-hidden rounded-b-3xl border-[7px] border-white shadow-float">
            <img src="/hero.jpg" alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="w-full">
          {notice}
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-float sm:p-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
