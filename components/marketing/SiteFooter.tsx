import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";
import { SafnomLogo } from "@/components/SafnomLogo";

import { marketingFooterProductLinks } from "@/config/marketing-nav";

const accountLinks = [
  { label: "Create account", href: "/signup" },
  { label: "Log in", href: "/login" },
];

const legalLinks = [
  { label: "Privacy policy", href: "#" },
  { label: "Terms of service", href: "#" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-card-border bg-card/20">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SafnomLogo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              <BrandWordmark size="inline" /> helps small businesses, local
              vendors, and entrepreneurs launch a professional web presence —
              without code, agencies, or surprise bills.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              Build your digital identity. Focus on your customers.
            </p>
            <Link
              href="/signup"
              className="btn-primary mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm"
            >
              Start building for free
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Product
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {marketingFooterProductLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Account
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-card-border/80 pt-8 sm:flex-row">
          <p className="text-center text-xs text-muted sm:text-left">
            © {year} <BrandWordmark size="inline" className="text-xs" />.
            All rights reserved. Hosting, SSL, and updates included on every
            plan.
          </p>
          <p className="text-xs text-muted">
            Questions?{" "}
            <a
              href="mailto:hello@safnom.com"
              className="font-medium text-brand hover:underline"
            >
              hello@safnom.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
