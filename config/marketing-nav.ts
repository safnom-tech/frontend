export const marketingNavLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/who-its-for", label: "Who it's for" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export const marketingFooterProductLinks = [
  ...marketingNavLinks,
  { href: "/domains", label: "Domains" },
  { href: "/about", label: "About" },
] as const;
