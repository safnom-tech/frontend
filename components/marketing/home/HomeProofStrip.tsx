import Link from "next/link";

export function HomeProofStrip() {
  return (
    <section className="bg-card/25 py-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 lg:flex-row lg:justify-between">
        <blockquote className="max-w-2xl text-center text-base leading-relaxed text-foreground/90 lg:text-left lg:text-lg">
          &ldquo;I quoted three agencies and couldn&apos;t afford any of them.{" "}
          <span className="font-medium text-foreground">
            SafNom gave me something I&apos;m proud to put on my business
            cards.
          </span>
          &rdquo;
          <footer className="mt-3 text-sm text-muted">
            — Marcus Webb, independent electrician
          </footer>
        </blockquote>
        <Link
          href="/who-its-for"
          className="btn-secondary shrink-0 rounded-xl px-5 py-2.5 text-sm"
        >
          More customer stories
        </Link>
      </div>
    </section>
  );
}
