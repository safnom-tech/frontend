const benefits = [
  {
    icon: "🚀",
    title: "Live in one session",
    text: "Templates and guided setup so you publish before the week ends.",
  },
  {
    icon: "🔒",
    title: "Hosting & SSL built in",
    text: "HTTPS, updates, and infrastructure — no separate bills or plugins.",
  },
  {
    icon: "✨",
    title: "AI when you need it",
    text: "Draft copy and polish pages; you approve every word on your brand.",
  },
];

export function HomeBenefits() {
  return (
    <section className="border-y border-card-border/80 bg-card/30">
      <ul className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-3 sm:py-12">
        {benefits.map((b) => (
          <li key={b.title} className="flex gap-4 sm:flex-col sm:gap-3 sm:text-center">
            <span
              className="feature-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg sm:mx-auto"
              aria-hidden
            >
              {b.icon}
            </span>
            <div>
              <h2 className="font-semibold text-foreground">{b.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
