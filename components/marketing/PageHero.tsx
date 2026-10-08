import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumb?: { label: string; href: string };
}) {
  return (
    <section className="border-b border-card-border/80 bg-card/25">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {breadcrumb ? (
          <nav className="mb-4 text-sm text-muted" aria-label="Breadcrumb">
            <Link href={breadcrumb.href} className="hover:text-brand">
              {breadcrumb.label}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-foreground">{title}</span>
          </nav>
        ) : null}
        {eyebrow ? (
          <p className="badge-brand mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </section>
  );
}
