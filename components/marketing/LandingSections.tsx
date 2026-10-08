import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";

const features = [
  {
    title: "Launch in minutes",
    description:
      "Pick a professional template, customize with drag-and-drop, and publish — no developers or designers required.",
    icon: "⚡",
  },
  {
    title: "Built for your budget",
    description:
      "Everything in one place: hosting, SSL, domains, and updates — at a fraction of agency costs.",
    icon: "💰",
  },
  {
    title: "AI that works for you",
    description:
      "Generate copy, images, and SEO-friendly content so your shop, restaurant, or service looks polished from day one.",
    icon: "✨",
  },
];

const audiences = [
  "Local shops",
  "Restaurants",
  "Freelancers",
  "Coaches",
  "Salons",
  "Photographers",
  "Consultants",
  "Startups",
];

const steps = [
  {
    step: "01",
    title: "Describe your business",
    description:
      "Share your name, industry, and what makes you unique. Our guided setup keeps it simple.",
  },
  {
    step: "02",
    title: "Pick a template & customize",
    description:
      "Choose a professional layout, adjust colors to match your brand, and add your photos and copy.",
  },
  {
    step: "03",
    title: "Publish & share",
    description:
      "Go live on a free safnom.site URL, then connect or purchase your custom domain when you're ready.",
    learnMore: { href: "/domains", label: "Purchase or connect a domain" },
  },
  {
    step: "04",
    title: "Grow with confidence",
    description:
      "Use AI-assisted content, SEO basics, and analytics to keep improving — without hiring an agency.",
  },
];

const platformPoints = [
  {
    title: "Professional templates",
    description:
      "Industry-ready designs for retail, food, services, and portfolios — so you never start from a blank page.",
  },
  {
    title: "Secure & reliable hosting",
    description:
      "HTTPS, fast delivery, and managed infrastructure so your site stays online while you run your business.",
  },
  {
    title: "AI content assistant",
    description:
      "Draft headlines, service descriptions, and meta text tuned for search — you stay in control of every word.",
  },
  {
    title: "One dashboard",
    description:
      "Edit pages, view performance, and manage your presence from a single workspace built for non-technical owners.",
  },
];

const testimonials = [
  {
    quote:
      "We had a menu PDF and an Instagram page. Within an afternoon we had a real website — customers finally find our hours and order link.",
    name: "Priya Sharma",
    role: "Owner, Spice Route Kitchen",
  },
  {
    quote:
      "I quoted three agencies and couldn't afford any of them. SafNom gave me something I'm proud to put on my business cards.",
    name: "Marcus Webb",
    role: "Independent electrician",
  },
  {
    quote:
      "I'm not technical at all. The step-by-step flow and templates made it feel like the product was built for people like me.",
    name: "Elena Torres",
    role: "Wellness coach",
  },
];

const faqItems = [
  {
    q: "Do I need coding or design skills?",
    a: "No. SafNom is built for business owners who want results, not code. Templates, drag-and-drop editing, and guided setup handle the technical work.",
  },
  {
    q: "What's included when I sign up?",
    a: "Secure hosting, SSL, mobile-responsive pages, and core editing tools. You can create an account and start building before choosing a paid plan.",
  },
  {
    q: "Can I buy a domain or connect one I already own?",
    a: "Yes. Start on a free yourname.safnom.site address, connect a domain you bought elsewhere via DNS, or purchase through SafNom when domain checkout launches. See the Domains page for the full connect flow.",
  },
  {
    q: "How is this different from hiring an agency?",
    a: "Agencies are great for large projects but costly and slow for small businesses. SafNom gives you speed, predictable pricing, and full control to update your site yourself.",
  },
  {
    q: "Is my data secure?",
    a: "We use industry-standard encryption, secure authentication, and HTTPS for every published site. Your account and customer-facing pages are protected by default.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You stay in control of your subscription. Export-friendly workflows and clear billing are part of how we earn your trust long term.",
  },
];

export function LandingHero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-20 sm:pb-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="badge-brand mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
          <span
            className="h-1.5 w-1.5 rounded-full bg-brand"
            aria-hidden
          />
          No code · No developers · Just your business
        </p>
        <h1 className="text-[clamp(1.5rem,3.6vw,3.125rem)] font-semibold leading-[1.2] tracking-tight text-foreground sm:whitespace-nowrap sm:leading-[1.15]">
          Build your digital identity with{" "}
          <BrandWordmark size="headline" />
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          The affordable all-in-one platform for small businesses, local vendors,
          and entrepreneurs — beautiful websites, hosting, and growth tools in
          one dashboard.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="btn-primary rounded-xl px-8 py-3.5 text-base shadow-lg"
          >
            Create your website free
          </Link>
          <Link
            href="/login"
            className="btn-secondary rounded-xl px-8 py-3.5 text-base"
          >
            I have an account
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          Trusted by shop owners, freelancers, and growing brands worldwide.
        </p>
      </div>

      <div
        className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-card-border bg-gradient-to-b from-card/90 to-card/40 p-1 shadow-2xl dark:shadow-black/40"
        style={{ boxShadow: "0 25px 50px -12px var(--btn-shadow)" }}
        aria-hidden
      >
        <div className="rounded-xl bg-slate-900/95 p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-slate-500">yourbusiness.safnom.site</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className="rounded-lg p-6 sm:col-span-2"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, var(--brand) 35%, transparent), color-mix(in srgb, var(--brand-deep) 25%, transparent))`,
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-accent-soft/80">
                Hero
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Fresh bakes, delivered daily
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Your neighborhood bakery — order online in seconds.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-800/80 p-4">
                <p className="text-xs text-slate-500">Menu</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-4">
                <p className="text-xs text-slate-500">Contact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      {showIntro ? (
        <div className="mx-auto max-w-2xl text-center">
          <p className="badge-brand mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold">
            Simple process
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From idea to live website in four steps
          </h2>
          <p className="mt-4 text-muted">
            No sprints, no wireframes, no developer tickets — just a clear path
            from signup to a site you&apos;re proud to share.
          </p>
        </div>
      ) : null}
      <ol
        className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${showIntro ? "mt-14" : "mt-0"}`}
      >
        {steps.map((s) => (
          <li
            key={s.step}
            className="glass-card rounded-2xl p-6 sm:p-7"
          >
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-sm font-bold text-brand-deep dark:bg-brand/20 dark:text-accent-soft"
              aria-hidden
            >
              {s.step}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {s.description}
            </p>
            {"learnMore" in s && s.learnMore ? (
              <Link
                href={s.learnMore.href}
                className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
              >
                {s.learnMore.label} →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PlatformHighlights() {
  return (
    <section className="border-t border-card-border/80 bg-card/25 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Enterprise-grade basics, priced for small business
            </h2>
            <p className="mt-4 text-muted">
              You shouldn&apos;t choose between looking professional and staying
              on budget. SafNom bundles the essentials owners actually need.
            </p>
          </div>
          <Link
            href="/signup"
            className="btn-secondary shrink-0 self-start rounded-xl px-6 py-3 text-sm lg:self-auto"
          >
            See it yourself — sign up free
          </Link>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {platformPoints.map((point) => (
            <li
              key={point.title}
              className="glass-card rounded-2xl border-l-4 border-l-brand p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {point.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Trusted by owners who wear every hat
        </h2>
        <p className="mt-4 text-muted">
          Real stories from people who needed a credible online presence without
          stopping their day job.
        </p>
      </div>
      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t) => (
          <li
            key={t.name}
            className="glass-card flex flex-col rounded-2xl p-8"
          >
            <p className="flex-1 text-sm leading-relaxed text-foreground/90">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-6 border-t border-card-border pt-5">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WhySafNomSection() {
  return (
    <section className="border-y border-card-border/80 bg-card/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Why teams choose SafNom over the alternatives
        </h2>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th className="pb-4 pr-4 font-medium text-muted" scope="col">
                  {" "}
                </th>
                <th
                  className="pb-4 pr-4 font-semibold text-brand"
                  scope="col"
                >
                  SafNom
                </th>
                <th className="pb-4 pr-4 font-medium text-muted" scope="col">
                  DIY website builder
                </th>
                <th className="pb-4 font-medium text-muted" scope="col">
                  Traditional agency
                </th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["Time to launch", "Hours", "Days–weeks", "Months"],
                ["Ongoing edits", "You, anytime", "You, with learning curve", "Ticket + invoice"],
                ["Hosting & SSL", "Included", "Often extra", "Often extra"],
                ["Built for SMB budgets", "Yes", "Varies", "Rarely"],
              ].map(([label, safnom, diy, agency]) => (
                <tr key={label} className="border-b border-card-border/60">
                  <th className="py-4 pr-4 font-medium text-foreground" scope="row">
                    {label}
                  </th>
                  <td className="py-4 pr-4 font-medium text-foreground">
                    {safnom}
                  </td>
                  <td className="py-4 pr-4">{diy}</td>
                  <td className="py-4">{agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {showIntro ? (
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted">
            Straight answers for owners evaluating their next move online.
          </p>
        </div>
      ) : null}
      <div className={`faq-list space-y-3 ${showIntro ? "mt-10" : "mt-0"}`}>
        {faqItems.map((item) => (
          <details key={item.q} className="faq-item glass-card rounded-xl px-5 py-1">
            <summary className="cursor-pointer list-none py-4 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FeatureGrid({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      {showIntro ? (
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to go online
          </h2>
          <p className="mt-4 text-muted">
            Stop juggling hosting, domains, and agencies. SafNom brings it
            together so you can focus on customers.
          </p>
        </div>
      ) : null}
      <ul
        className={`grid gap-6 sm:grid-cols-3 ${showIntro ? "mt-12" : "mt-0"}`}
      >
        {features.map((f) => (
          <li
            key={f.title}
            className="glass-card rounded-2xl p-8 transition-transform hover:-translate-y-0.5"
          >
            <span
              className="feature-icon flex h-12 w-12 items-center justify-center rounded-xl text-xl"
              aria-hidden
            >
              {f.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {f.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AudienceStrip() {
  return (
    <section className="border-y border-card-border/80 bg-card/30 py-14">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Made for real businesses
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Whether you run a corner shop, a coaching practice, or a growing
          online store — SafNom scales with you.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {audiences.map((label) => (
            <li
              key={label}
              className="rounded-full border border-card-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground/90"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16"
        style={{
          background: `linear-gradient(135deg, var(--brand-deep), var(--brand), color-mix(in srgb, var(--brand-light) 80%, var(--brand)))`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <p className="text-sm font-medium uppercase tracking-widest text-white/80">
          Ready when you are
        </p>
        <blockquote className="relative mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
          Your customers are searching online today. Give them a professional
          home — without the agency price tag.
        </blockquote>
        <p className="relative mx-auto mt-4 max-w-lg text-sm text-white/85">
          Free to start. Create your account in minutes and publish when
          you&apos;re ready.
        </p>
        <Link
          href="/signup"
          className="relative mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-deep shadow-lg transition hover:bg-white/90"
        >
          Get started — it&apos;s free
        </Link>
      </div>
    </section>
  );
}

