import Link from "next/link";

const links = [
  {
    href: "/features",
    title: "Features",
    blurb: "Templates, dashboard, AI, analytics.",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    blurb: "Four steps from signup to live.",
  },
  {
    href: "/domains",
    title: "Domains",
    blurb: "Subdomain, connect, or buy soon.",
  },
  {
    href: "/pricing",
    title: "Pricing",
    blurb: "Start free, grow when ready.",
  },
];

export function HomeDiscover() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Go deeper on your terms
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Details live on their own pages — pick what matters to you without
            scrolling through everything here.
          </p>
        </div>
        <Link
          href="/faq"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Questions? Read FAQ →
        </Link>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="glass-card group block rounded-xl px-5 py-4 transition-colors hover:border-brand/40"
            >
              <span className="font-semibold group-hover:text-brand">
                {item.title}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {item.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center text-xs text-muted sm:text-left">
        Also:{" "}
        <Link href="/who-its-for" className="text-brand hover:underline">
          Who it&apos;s for
        </Link>
        {" · "}
        <Link href="/about" className="text-brand hover:underline">
          About us
        </Link>
      </p>
    </section>
  );
}
