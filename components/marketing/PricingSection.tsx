import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    period: "to explore",
    description: "Create your account, try templates, and draft your first site.",
    highlights: [
      "SafNom subdomain",
      "Core templates",
      "Mobile-responsive pages",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Growth",
    price: "Coming soon",
    period: "per month",
    description: "Publish with custom domain, SSL, and tools to grow traffic.",
    highlights: [
      "Custom domain connect",
      "SSL & hosting included",
      "AI content assistant",
      "Basic analytics",
    ],
    cta: "Join waitlist via signup",
    href: "/signup",
    featured: true,
  },
  {
    name: "Business",
    price: "Coming soon",
    period: "per month",
    description: "For teams that need priority support and advanced controls.",
    highlights: [
      "Everything in Growth",
      "Priority support",
      "Team access (planned)",
      "Advanced SEO tools",
    ],
    cta: "Contact us",
    href: "mailto:hello@safnom.com",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <ul className="grid gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <li
            key={tier.name}
            className={`glass-card flex flex-col rounded-2xl p-8 ${
              tier.featured
                ? "ring-2 ring-brand/40 lg:-translate-y-1"
                : ""
            }`}
          >
            {tier.featured ? (
              <p className="badge-brand mb-4 inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold">
                Most popular
              </p>
            ) : null}
            <h3 className="text-xl font-semibold">{tier.name}</h3>
            <p className="mt-3">
              <span className="text-3xl font-bold text-brand">{tier.price}</span>
              {tier.period ? (
                <span className="ml-2 text-sm text-muted">{tier.period}</span>
              ) : null}
            </p>
            <p className="mt-3 text-sm text-muted">{tier.description}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-foreground/90">
              {tier.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-brand" aria-hidden>
                    ✓
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={
                tier.featured
                  ? "btn-primary mt-8 rounded-xl px-6 py-3 text-center text-sm"
                  : "btn-secondary mt-8 rounded-xl px-6 py-3 text-center text-sm"
              }
            >
              {tier.cta}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
        Paid plans are rolling out with early access for signups. You can build
        and explore on Starter today with no credit card.
      </p>
    </section>
  );
}
