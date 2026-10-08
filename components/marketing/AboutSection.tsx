import { BrandWordmark } from "@/components/BrandWordmark";

export function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Our mission</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Small businesses drive local economies, but too many still rely on
            word-of-mouth alone while competitors show up first on Google.{" "}
            <BrandWordmark size="inline" /> exists to close that gap — without
            forcing owners to learn code or pay agency retainers they cannot
            afford.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            We combine website building, hosting, and practical AI assistance
            into one calm dashboard. You stay in control of your brand; we handle
            the heavy technical lift behind the scenes.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-lg font-semibold">What we believe</h3>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-foreground">Clarity beats complexity.</strong>{" "}
              Every screen should feel obvious to a busy shop owner on a lunch
              break.
            </li>
            <li>
              <strong className="text-foreground">Trust is earned.</strong>{" "}
              Transparent pricing, secure defaults, and no dark patterns.
            </li>
            <li>
              <strong className="text-foreground">Growth is shared.</strong>{" "}
              When your site brings in customers, we succeed together.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
