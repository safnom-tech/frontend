import Link from "next/link";
import { SafnomLogo } from "@/components/SafnomLogo";
import { SiteHeaderActions } from "@/components/SiteHeaderActions";
import { marketingNavLinks } from "@/config/marketing-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border/70 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <SafnomLogo />
        <nav
          className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex"
          aria-label="Main"
        >
          {marketingNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <SiteHeaderActions />
      </div>
    </header>
  );
}
