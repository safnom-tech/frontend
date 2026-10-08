import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";

function ProductPreview() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-b from-card/90 to-card/40 p-1 shadow-xl"
      style={{ boxShadow: "0 20px 40px -16px var(--btn-shadow)" }}
      aria-hidden
    >
      <div className="rounded-xl bg-slate-900/95 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate text-[11px] text-slate-500">
            yourbusiness.safnom.site
          </span>
        </div>
        <div
          className="rounded-lg p-5"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--brand) 38%, transparent), color-mix(in srgb, var(--brand-deep) 28%, transparent))`,
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent-soft/90">
            Live preview
          </p>
          <p className="mt-2 text-base font-semibold text-white sm:text-lg">
            Your business, online tonight
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Templates, menu, booking, contact — one link for customers.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Pages", "Domain", "Publish"].map((label) => (
            <div
              key={label}
              className="rounded-md bg-slate-800/90 py-2 text-center text-[10px] text-slate-400"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 pt-10 sm:pb-14 sm:pt-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="badge-brand mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            AI website builder for small business
          </p>
          <h1 className="text-[clamp(1.65rem,3.4vw,2.85rem)] font-semibold leading-[1.18] tracking-tight text-foreground lg:max-w-xl">
            Build your digital identity with{" "}
            <BrandWordmark size="headline" className="lg:whitespace-nowrap" />
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted lg:mx-0 sm:text-lg">
            Professional websites, secure hosting, and smart content tools — one
            calm dashboard for shop owners and entrepreneurs who need results,
            not code.
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted lg:justify-start">
            <li className="flex items-center gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              Free to start
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              SSL included
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              Custom domain ready
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/signup"
              className="btn-primary rounded-xl px-7 py-3 text-sm shadow-lg sm:text-base"
            >
              Start building free
            </Link>
            <Link
              href="/how-it-works"
              className="btn-secondary rounded-xl px-7 py-3 text-sm sm:text-base"
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
