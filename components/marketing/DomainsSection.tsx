import Link from "next/link";

const connectSteps = [
  {
    title: "Add your domain in SafNom",
    body: "Open Domains in your dashboard, enter your domain (e.g. yourbusiness.com), and we show the exact DNS records you need.",
  },
  {
    title: "Update DNS at your registrar",
    body: "Copy the A/CNAME records into GoDaddy, Namecheap, Google Domains, or wherever you bought the name. Changes usually propagate within an hour.",
  },
  {
    title: "We verify & enable SSL",
    body: "SafNom checks ownership automatically and provisions HTTPS. Your site serves on your brand URL with a secure padlock.",
  },
];

const purchaseHighlights = [
  "Search available names inside SafNom (coming soon)",
  "Renewals and billing in the same dashboard as your site",
  "DNS pre-configured — no manual record copying for purchased domains",
  "Transfer support for domains you already own (planned)",
];

export function DomainsSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <article className="glass-card rounded-2xl p-8">
          <p className="badge-brand inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            Recommended to start
          </p>
          <h2 className="mt-4 text-2xl font-semibold">Free SafNom subdomain</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Every new workspace gets a secure URL like{" "}
            <code className="rounded bg-card-border/40 px-1.5 py-0.5 text-foreground">
              yourbusiness.safnom.site
            </code>{" "}
            so you can publish immediately while you decide on a custom name.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-foreground/90">
            <li className="flex gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              HTTPS included
            </li>
            <li className="flex gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              Share on cards, social, and Google Business
            </li>
            <li className="flex gap-2">
              <span className="text-brand" aria-hidden>
                ✓
              </span>
              Switch to custom domain later without rebuilding
            </li>
          </ul>
        </article>

        <article className="glass-card rounded-2xl p-8 ring-1 ring-brand/25">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Custom brand URL
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Connect your domain</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Already own a domain? Point it to SafNom hosting. You keep control at
            your registrar; we handle the site, SSL, and routing.
          </p>
          <ol className="mt-6 space-y-4">
            {connectSteps.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-sm font-bold text-brand-deep dark:text-accent-soft">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <article className="glass-card mt-8 rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">Purchase a domain in SafNom</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We&apos;re integrating domain search and checkout so you can buy a
              name, connect DNS, and publish — without leaving the builder.
              Early access rolls out to Growth plan signups first.
            </p>
          </div>
          <span className="badge-brand shrink-0 self-start rounded-full px-4 py-1.5 text-xs font-semibold">
            Coming soon
          </span>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {purchaseHighlights.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-muted">
              <span className="text-brand" aria-hidden>
                ◆
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/signup" className="btn-primary rounded-xl px-6 py-3 text-sm">
            Create account — connect later
          </Link>
          <Link
            href="/pricing"
            className="btn-secondary rounded-xl px-6 py-3 text-sm"
          >
            View plans
          </Link>
        </div>
      </article>

      <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-muted">
        Need help choosing? Email{" "}
        <a
          href="mailto:hello@safnom.com"
          className="font-medium text-brand hover:underline"
        >
          hello@safnom.com
        </a>{" "}
        with your current registrar and we&apos;ll outline the fastest path for
        your domain.
      </p>
    </div>
  );
}
