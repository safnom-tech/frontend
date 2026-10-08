import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";

export function HomeCtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <div
        className="flex flex-col items-center gap-6 rounded-2xl px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left sm:px-10"
        style={{
          background: `linear-gradient(125deg, var(--brand-deep), var(--brand), color-mix(in srgb, var(--brand-light) 75%, var(--brand)))`,
        }}
      >
        <div className="max-w-lg">
          <p className="text-lg font-semibold sm:text-xl">
            Ready to put{" "}
            <BrandWordmark size="inline" className="brand-name-on-light" />{" "}
            to work for your business?
          </p>
          <p className="mt-2 text-sm text-white/85">
            Create your account in minutes. Publish on a free subdomain, then
            connect your domain when you&apos;re ready.
          </p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-brand-deep shadow-lg transition hover:bg-white/90"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
}
