"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { followsLogisticsHero } from "@/components/editor/sections/sectionLayout";
import {
  footerQuickLinksFromSections,
  footerServiceLinksFromSections,
  navItemsFromSections,
  pageHasAnchor,
} from "@/components/editor/sections/sectionNav";
import {
  InlineInnovationCard,
  InlinePipeItemEditor,
  InlinePillarCell,
  InlineSimpleListItem,
} from "@/components/editor/inline/InlineCardEditors";
import {
  InlineAddFeatureCard,
  InlineAddGalleryPhoto,
  InlineAddListItem,
} from "@/components/editor/inline/InlineAddPattern";
import {
  InlineGallerySlot,
  InlineImage,
  InlineText,
} from "@/components/editor/inline/InlineField";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import { LogisticsServiceIcon } from "@/components/site/LogisticsIcons";
import { ContactInquiryForm } from "@/components/site/ContactInquiryForm";
import { usePublicSiteMedia } from "@/contexts/PublicSiteMediaContext";
import { mediaUrlForDisplay } from "@/services/media.api";
import type { ContactInquiryTarget } from "@/types/inquiry";
import type { PageSection } from "@/types/page";

/** Reliable logistics photo used when a card image is missing or fails to load. */
const DEFAULT_LOGISTICS_IMAGE =
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80";
const DEFAULT_WAREHOUSE_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80";
function LogisticsCardImage({
  src,
  alt,
  fallback = DEFAULT_LOGISTICS_IMAGE,
}: {
  src?: string;
  alt: string;
  fallback?: string;
}) {
  const publicSite = usePublicSiteMedia();
  const initial = src?.trim()
    ? mediaUrlForDisplay(src, { publicSite })
    : fallback;
  return (
    <div className="mb-3 aspect-[16/10] overflow-hidden bg-neutral-200 grayscale">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={initial}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          const el = e.currentTarget;
          if (el.src !== fallback) {
            el.src = fallback;
          }
        }}
      />
    </div>
  );
}

type ViewProps = {
  section: PageSection;
  style: CSSProperties;
  themeVars: CSSProperties;
  /** Full page sections — used by header to build nav from what exists. */
  pageSections?: PageSection[];
  inquiryTarget?: ContactInquiryTarget | null;
};

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function items(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
}

function lines(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(/[·|,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function CtaLink({
  href,
  children,
  className,
  style,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const inlineEdit = useSectionInlineEdit();
  const url = href.trim();
  if (!url) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  if (inlineEdit?.enabled) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  function onAnchorClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.();
    if (!url.startsWith("#") || url.length < 2) return;
    const id = url.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Keep hash in URL for shareable deep links when possible
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", url);
    }
  }

  return (
    <a href={url} className={className} style={style} onClick={onAnchorClick}>
      {children}
    </a>
  );
}

function navHrefFromLabel(label: string): string {
  const key = label.trim().toLowerCase();
  const map: Record<string, string> = {
    home: "#home",
    corporate: "#corporate",
    "we offer": "#services",
    services: "#services",
    partners: "#about",
    quote: "#quote",
    news: "#services",
    "contact us": "#contact",
    contact: "#contact",
    track: "#track",
    "track your shipment": "#track",
    "shipment tracking": "#track",
    "get a quote": "#quote",
    "project cargo": "#services",
    "shipping agency": "#services",
    "air freight": "#services",
    "land freight": "#services",
    "sea freight": "#services",
    "news & events": "#about",
    careers: "#contact",
    reserve: "#contact",
    menu: "#signature-menu",
    reviews: "#reviews",
    story: "#story",
  };
  return map[key] ?? `#${key.replace(/\s+/g, "-")}`;
}

function parseNavItem(item: string): { label: string; sub: string; href: string } {
  const parts = item.split("|").map((s) => s.trim());
  const label = parts[0] || item;
  const second = parts[1] || "";
  const third = parts[2] || "";
  // Formats: Label|Subtitle|#href  OR  Label|#href  OR  Label|Subtitle
  if (second.startsWith("#")) {
    return { label, sub: "", href: second };
  }
  if (third.startsWith("#")) {
    return { label, sub: second, href: third };
  }
  return { label, sub: second, href: navHrefFromLabel(label) };
}

function parseFooterLink(item: string): { label: string; href: string } {
  const parts = item.split("|").map((s) => s.trim());
  if (parts.length >= 2 && parts[1].startsWith("#")) {
    return { label: parts[0] || item, href: parts[1] };
  }
  return { label: item, href: navHrefFromLabel(item) };
}

function variantOf(section: PageSection): string {
  return String((section.settings as { variant?: string }).variant ?? "default");
}

function LogisticsNavMenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M6.4 5.3 12 10.9l5.6-5.6 1.4 1.4L13.4 12.3l5.6 5.6-1.4 1.4L12 13.7l-5.6 5.6-1.4-1.4 5.6-5.6-5.6-5.6z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M4 7h16v1.5H4V7zm0 4.75h16V13.5H4v-1.75zm0 4.75h16V18H4v-1.5z"
      />
    </svg>
  );
}

function LogisticsHeaderView({
  d,
  nav,
  showTrack,
  trackHref,
  style,
  themeVars,
}: {
  d: Record<string, unknown>;
  nav: { label: string; sub: string; href: string }[];
  showTrack: boolean;
  trackHref: string;
  style: CSSProperties;
  themeVars: CSSProperties;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const contactRow = (
    <>
      {str(d.phone) ? (
        <a
          href={`tel:${str(d.phone).replace(/\s+/g, "")}`}
          className="hover:text-white"
          onClick={() => setMenuOpen(false)}
        >
          {str(d.phone)}
        </a>
      ) : null}
      {showTrack ? (
        <CtaLink
          href={trackHref}
          className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-white hover:opacity-80"
          onClick={() => setMenuOpen(false)}
        >
          <span aria-hidden className="text-xs">
            ◉
          </span>
          {str(d.trackLabel)}
        </CtaLink>
      ) : null}
    </>
  );

  return (
    <header
      id="top"
      style={{ ...themeVars, ...style }}
      className="text-white"
    >
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 @sm/site:px-8">
          <CtaLink href="#home" className="flex min-w-0 items-center gap-3">
            <InlineImage
              urlField="logoUrl"
              altField="logoAlt"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/30"
              imgClassName="h-9 w-9 shrink-0 object-cover"
              emptyLabel="Logo"
            >
              {!str(d.logoUrl) ? (
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-[10px] font-bold tracking-wide"
                >
                  {(str(d.logoText, "B").slice(0, 2) || "B").toUpperCase()}
                </span>
              ) : null}
            </InlineImage>
            <div className="min-w-0">
              <InlineText
                field="logoText"
                as="p"
                className="truncate text-sm font-semibold tracking-wide"
                placeholder="Business name"
              />
              <InlineText
                field="logoSub"
                as="p"
                className="truncate text-[10px] tracking-wide text-white/55"
                placeholder="Tagline"
              />
            </div>
          </CtaLink>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden flex-wrap items-center gap-4 text-[11px] tracking-wide text-white/85 @md/site:flex">
              {contactRow}
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-white transition hover:bg-white/10 @md/site:hidden"
              aria-expanded={menuOpen}
              aria-controls="logistics-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <LogisticsNavMenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="mx-auto hidden max-w-7xl flex-wrap items-end justify-center gap-x-4 gap-y-2 px-4 py-3 @md/site:flex @lg/site:gap-x-8 @sm/site:px-8 @md/site:gap-x-6"
      >
        {nav.map((item) => (
          <CtaLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="text-center transition hover:opacity-80"
          >
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em]">
              {item.label}
            </span>
            {item.sub ? (
              <span className="mt-0.5 block text-[9px] tracking-wide text-white/45">
                {item.sub}
              </span>
            ) : null}
          </CtaLink>
        ))}
      </nav>

      {menuOpen ? (
        <nav
          id="logistics-mobile-nav"
          aria-label="Primary mobile"
          className="border-b border-white/10 @md/site:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 @sm/site:px-8">
            {(str(d.phone) || showTrack) && (
              <div className="mb-3 flex flex-col gap-2 border-b border-white/10 pb-3 text-[11px] tracking-wide text-white/85">
                {contactRow}
              </div>
            )}
            {nav.map((item) => (
              <CtaLink
                key={`mobile-${item.href}-${item.label}`}
                href={item.href}
                className="block rounded-md px-2 py-2.5 transition hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {item.label}
                </span>
                {item.sub ? (
                  <span className="mt-0.5 block text-[9px] tracking-wide text-white/45">
                    {item.sub}
                  </span>
                ) : null}
              </CtaLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function HeaderSectionView({
  section,
  style,
  themeVars,
  pageSections = [],
}: ViewProps) {
  const d = section.data;
  if (variantOf(section) === "logistics") {
    const fromPage = navItemsFromSections(pageSections);
    const nav =
      fromPage.length > 0
        ? fromPage
        : (
            Array.isArray(d.navItems) && d.navItems.length > 0
              ? (d.navItems as unknown[]).map((x) => String(x))
              : lines(d.navLabel)
          ).map(parseNavItem);
    const trackHref = str(d.trackUrl, "#track");
    const showTrack =
      Boolean(str(d.trackLabel)) &&
      (trackHref.startsWith("#")
        ? pageSections.length === 0 || pageHasAnchor(pageSections, trackHref)
        : true);
    return (
      <LogisticsHeaderView
        d={d}
        nav={nav}
        showTrack={showTrack}
        trackHref={trackHref}
        style={style}
        themeVars={themeVars}
      />
    );
  }

  if (variantOf(section) === "fashion") {
    const nav =
      Array.isArray(d.navItems) && d.navItems.length > 0
        ? lines(d.navItems)
        : lines(d.navLabel);
    const utilities = lines(d.utilityLinks);
    return (
      <header style={{ ...themeVars, ...style }} className="bg-white text-black">
        {str(d.announcement) ? (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black px-4 py-2 text-[10px] font-medium tracking-[0.14em] text-white sm:px-8 sm:text-[11px]">
            <span>{str(d.announcement)}</span>
            {str(d.announcementLinks) ? (
              <span className="opacity-80">{str(d.announcementLinks)}</span>
            ) : null}
          </div>
        ) : null}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <nav className="hidden flex-1 gap-5 text-[11px] font-semibold tracking-[0.16em] md:flex">
            {nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
          <p className="flex-1 text-center text-2xl font-black tracking-[0.2em] sm:text-3xl">
            {str(d.logoText, "BRAND")}
          </p>
          <div className="hidden flex-1 justify-end gap-4 text-[11px] font-semibold tracking-[0.12em] md:flex">
            {(utilities.length ? utilities : ["SEARCH", "LOGIN", "WISHLIST", "CART"]).map(
              (item) => (
                <span key={item}>{item}</span>
              )
            )}
          </div>
          <p className="text-[11px] font-semibold tracking-wide md:hidden">
            {nav.slice(0, 2).join(" · ")}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header
      style={{ ...themeVars, ...style }}
      className="border-b border-black/10"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <InlineText
          field="logoText"
          as="p"
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--editor-primary)" }}
          fallback="Brand"
        />
        <InlineText
          field="navLabel"
          as="p"
          className="text-xs font-medium tracking-wide text-muted sm:text-sm"
          placeholder="Navigation label"
        />
      </div>
    </header>
  );
}

function heroRadiusClass(radius: string | undefined): string {
  if (radius === "none") return "rounded-none";
  if (radius === "md") return "rounded-2xl";
  return "rounded-3xl";
}

export function HeroSectionView({ section, style, themeVars }: ViewProps) {
  const publicSite = usePublicSiteMedia();
  const d = section.data;
  const s = section.settings as {
    layout?: string;
    imagePosition?: string;
    imageRadius?: string;
    alignment?: string;
    variant?: string;
  };

  if (s.variant === "logistics") {
    const imageUrl = str(d.imageUrl);
    return (
      <section
        id="home"
        style={{ ...themeVars, ...style }}
        className="relative z-0 isolate min-h-[min(80vh,720px)] scroll-mt-28 overflow-hidden text-white sm:min-h-[min(88vh,820px)]"
      >
        <div className="absolute inset-0 z-[1]">
          {imageUrl ? (
            <InlineImage
              urlField="imageUrl"
              altField="imageAlt"
              className="absolute inset-0"
              imgClassName="absolute inset-0 h-full w-full object-cover object-center grayscale"
              emptyLabel="Hero photo"
            />
          ) : (
            <InlineImage
              urlField="imageUrl"
              altField="imageAlt"
              className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black"
              imgClassName="absolute inset-0 h-full w-full object-cover object-center grayscale"
              emptyLabel="Add hero photo — or use Banner image above"
            />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-black/55" />
        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[min(80vh,720px)] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[min(88vh,820px)] sm:px-8 sm:py-24 [&_a]:pointer-events-auto [&_[contenteditable]]:pointer-events-auto [&_[role=presentation]]:pointer-events-auto [&_button]:pointer-events-auto">
          <InlineText
            field="eyebrow"
            as="p"
            className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80"
            placeholder="Eyebrow"
          />
          <InlineText
            field="title"
            as="h1"
            className="mt-3 text-[1.65rem] font-black uppercase leading-tight tracking-[0.04em] @min-[400px]/site:text-3xl @sm/site:text-5xl @md/site:text-6xl @lg/site:text-7xl"
            placeholder="Headline"
          />
          <div id="quote" className="scroll-mt-28">
            <CtaLink
              href={str(d.buttonUrl, "#contact")}
              className="mt-8 inline-flex rounded-full border border-white bg-white px-8 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-transparent hover:text-white"
            >
              <InlineText field="buttonText" placeholder="Button label" />
            </CtaLink>
          </div>
        </div>
      </section>
    );
  }

  if (s.variant === "fashion") {
    const imageUrl = str(d.imageUrl);
    const wordmark = str(d.brandWordmark, str(d.title, "BRAND"));
    return (
      <section
        style={{ ...themeVars, ...style }}
        className="relative overflow-hidden bg-[#ececee] text-black"
      >
        <div className="relative mx-auto flex min-h-[min(78vh,720px)] max-w-7xl flex-col justify-between px-4 py-8 sm:px-8 sm:py-10">
          <p className="relative z-20 text-[11px] font-semibold tracking-[0.22em] text-black/70">
            {str(d.eyebrow, "FASHION THAT MOVES WITH YOU.")}
          </p>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none text-center text-[22vw] font-black leading-none tracking-tight text-black/[0.92] sm:text-[12rem] lg:text-[14rem]"
          >
            {wordmark}
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 items-end justify-center pb-2 pt-10 sm:items-center sm:pb-0 sm:pt-0">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrlForDisplay(imageUrl, { publicSite })}
                alt={str(d.imageAlt, "Hero campaign")}
                className="max-h-[520px] w-auto object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="flex h-[420px] w-full max-w-md items-center justify-center border border-dashed border-black/20 bg-white/40 text-sm text-black/50">
                Add hero image in editor
              </div>
            )}
          </div>

          <div className="relative z-20 flex flex-wrap items-end justify-between gap-4 pt-6">
            <div className="flex flex-wrap items-center gap-5">
              {str(d.buttonText) ? (
                <CtaLink
                  href={str(d.buttonUrl, "#")}
                  className="inline-flex bg-black px-7 py-3 text-[11px] font-bold tracking-[0.16em] text-white"
                >
                  {str(d.buttonText)}
                </CtaLink>
              ) : null}
              {str(d.secondaryButtonText) ? (
                <CtaLink
                  href={str(d.secondaryButtonUrl, "#")}
                  className="text-[11px] font-semibold tracking-[0.14em] underline underline-offset-4"
                >
                  {str(d.secondaryButtonText)}
                </CtaLink>
              ) : null}
            </div>
            {str(d.collectionLabel) ? (
              <p className="text-[10px] font-semibold tracking-[0.28em] text-black/60 [writing-mode:vertical-rl] sm:tracking-[0.35em]">
                {str(d.collectionLabel)}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (s.variant === "promo") {
    const imageUrl = str(d.imageUrl);
    const imageRight = (s.imagePosition ?? "right") !== "left";
    const copy = (
      <div className="flex min-h-[320px] flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-black/55">
          {str(d.eyebrow, "NEW SEASON")}
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          {str(d.title, "NEW VIBES")}
        </h2>
        {str(d.description) ? (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-black/70 sm:text-base">
            {str(d.description)}
          </p>
        ) : null}
        {str(d.buttonText) ? (
          <CtaLink
            href={str(d.buttonUrl, "#")}
            className="mt-8 inline-flex w-fit bg-black px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white"
          >
            {str(d.buttonText)}
          </CtaLink>
        ) : null}
      </div>
    );
    const image = (
      <div className="min-h-[320px] bg-[#d7d7d9]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrlForDisplay(imageUrl, { publicSite })}
            alt={str(d.imageAlt, "Campaign")}
            className="h-full min-h-[320px] w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-black/40">
            Add campaign image
          </div>
        )}
      </div>
    );
    return (
      <section style={{ ...themeVars, ...style }} className="bg-[#ececee] text-black">
        <div className="grid lg:grid-cols-2">
          {imageRight ? (
            <>
              {copy}
              {image}
            </>
          ) : (
            <>
              {image}
              {copy}
            </>
          )}
        </div>
      </section>
    );
  }

  const layout = s.layout ?? "split";
  const imageRight = (s.imagePosition ?? "right") !== "left";
  const imageUrl = str(d.imageUrl);
  const radius = heroRadiusClass(s.imageRadius);

  const copy = (
    <div
      className={`flex min-w-0 flex-col justify-center ${
        s.alignment === "center" ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <InlineText
        field="title"
        as="h1"
        className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
        placeholder="Headline"
      />
      <InlineText
        field="description"
        as="p"
        className="mt-4 max-w-xl text-base leading-relaxed opacity-85 sm:text-lg"
        placeholder="Description"
        multiline
      />
      <div
        className={`mt-6 flex flex-wrap gap-3 ${
          s.alignment === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <CtaLink
          href={str(d.buttonUrl)}
          className="inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10"
          style={{ background: "var(--editor-primary)" }}
        >
          <InlineText field="buttonText" placeholder="Primary button" />
        </CtaLink>
        <CtaLink
          href={str(d.secondaryButtonUrl)}
          className="inline-flex rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm"
        >
          <InlineText field="secondaryButtonText" placeholder="Secondary button" />
        </CtaLink>
      </div>
    </div>
  );

  const image = (
    <div className="min-w-0">
      <InlineImage
        urlField="imageUrl"
        altField="imageAlt"
        className={`aspect-[4/3] w-full overflow-hidden shadow-lg shadow-black/10 ring-1 ring-black/5 ${radius}`}
        imgClassName={`aspect-[4/3] w-full object-cover ${radius}`}
        emptyLabel="Banner image"
      />
    </div>
  );

  if (layout === "center") {
    return (
      <section
        style={{ ...themeVars, ...style, background: "var(--editor-bg)", color: "var(--editor-text)" }}
        className="mx-auto max-w-3xl"
      >
        {copy}
        <div className="mt-8 w-full">{image}</div>
      </section>
    );
  }

  return (
    <section
      style={{ ...themeVars, ...style, background: "var(--editor-bg)", color: "var(--editor-text)" }}
      className="mx-auto max-w-6xl"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {imageRight ? (
          <>
            {copy}
            {image}
          </>
        ) : (
          <>
            {image}
            {copy}
          </>
        )}
      </div>
    </section>
  );
}

export function TextSectionView({ section, style, themeVars }: ViewProps) {
  return (
    <section style={{ ...themeVars, ...style }} className="mx-auto max-w-3xl">
      <InlineText
        field="heading"
        as="h2"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
        placeholder="Heading"
      />
      <InlineText
        field="body"
        as="p"
        className="mt-4 whitespace-pre-wrap text-base leading-relaxed opacity-90 sm:text-lg"
        placeholder="Write your text…"
        multiline
      />
    </section>
  );
}

export function ImageSectionView({ section, style, themeVars }: ViewProps) {
  return (
    <section style={{ ...themeVars, ...style }}>
      <InlineImage
        urlField="url"
        altField="alt"
        className="w-full"
        imgClassName="max-h-[28rem] w-full object-cover"
        emptyLabel="Add photo"
      />
    </section>
  );
}

type CategoryCard = {
  title: string;
  description: string;
  linkLabel: string;
  imageUrl?: string;
};

function parseCategoryCards(d: Record<string, unknown>): CategoryCard[] {
  if (Array.isArray(d.categories)) {
    return (d.categories as Record<string, unknown>[]).map((c) => ({
      title: str(c.title, "Category"),
      description: str(c.description),
      linkLabel: str(c.linkLabel, "SHOP →"),
      imageUrl: str(c.imageUrl) || undefined,
    }));
  }
  return items(d.items).map((line) => {
    const [title, description, linkLabel] = line.split("|").map((s) => s.trim());
    return {
      title: title || "Category",
      description: description || "",
      linkLabel: linkLabel || `SHOP ${title || ""} →`,
    };
  });
}

export function ListSectionView({
  section,
  style,
  themeVars,
  fallbackHeading,
  pageSections = [],
}: ViewProps & { fallbackHeading: string }) {
  const publicSite = usePublicSiteMedia();
  const d = section.data;
  const variant = variantOf(section);

  if (variant === "serviceCards") {
    const lines = items(d.items);
    const sorted = [...pageSections].sort((a, b) => a.order - b.order);
    const sectionIndex = sorted.findIndex((s) => s.id === section.id);
    const overlapHero =
      sorted.length > 0 &&
      sectionIndex > 0 &&
      followsLogisticsHero(sorted, sectionIndex);
    return (
      <section
        style={{ ...themeVars, ...style }}
        className={
          overlapHero ? "relative z-20 pb-0" : "relative pb-12 sm:pb-16"
        }
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div
            className={`grid grid-cols-1 items-stretch gap-0 rounded-sm bg-[var(--site-muted-bg)] shadow-[0_10px_32px_rgba(0,0,0,0.1)] @min-[420px]/site:grid-cols-2 @sm/site:grid-cols-3 @lg/site:grid-cols-5 ${
              overlapHero ? "relative z-20 -translate-y-1/2" : ""
            }`}
          >
              {lines.map((line, index) => {
              const title = line.split("|")[0]?.trim() || line;
              return (
              <div
                key={`${index}-${line}`}
                className="group relative flex min-h-[148px] flex-col items-center justify-center border-r border-black/[0.06] bg-[var(--site-muted-bg)] px-3 py-6 text-center text-neutral-800 transition duration-200 last:border-r-0 hover:bg-[var(--site-dark)] hover:text-[var(--site-on-dark)]"
              >
                <InlinePipeItemEditor
                  field="items"
                  index={index}
                  wrapperClassName="flex w-full flex-col items-center"
                  titleClassName="text-[11px] font-bold uppercase tracking-[0.14em]"
                  descriptionClassName="mt-1 text-[10px] leading-snug text-neutral-500 transition group-hover:text-white/70"
                >
                  <LogisticsServiceIcon
                    name={title}
                    className="mb-3 h-12 w-12 text-neutral-500 transition group-hover:text-white"
                  />
                </InlinePipeItemEditor>
                <span
                  aria-hidden
                  className="mt-3 flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[11px] opacity-0 transition group-hover:border-white group-hover:opacity-100"
                >
                  →
                </span>
              </div>
            );
            })}
            <InlineAddListItem
              field="items"
              template="New service|Short description"
              label="+ Add service"
              className="min-h-[148px] rounded-none border-r-0 text-[10px] last:border-r-0"
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "whyChoose") {
    const pillars = items(d.pillars);
    const pillarCount = Math.max(pillars.length, 3);
    return (
      <section
        style={{ ...themeVars, ...style }}
        className="relative z-10 overflow-x-hidden text-neutral-900"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <InlineText
            field="heading"
            as="h2"
            className="text-center text-2xl font-bold tracking-tight sm:text-4xl"
            placeholder={fallbackHeading}
            fallback={fallbackHeading}
          />
          <div className="relative mx-auto mt-10 max-w-3xl">
            <div className="absolute left-[8%] right-[8%] top-2 hidden border-t border-neutral-300 sm:block" />
            <div className="relative grid grid-cols-1 gap-6 @md/site:grid-cols-3 @md/site:gap-4">
              {Array.from({ length: pillarCount }).map((_, i) => (
                <InlinePillarCell
                  key={i}
                  index={i}
                  textClassName="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-700"
                  placeholder={`Pillar ${i + 1}`}
                />
              ))}
            </div>
            <InlineAddListItem
              field="pillars"
              template="NEW PILLAR"
              label="+ Add pillar"
              className="mx-auto mt-6 max-w-xs min-h-[3rem] text-[10px]"
            />
          </div>
          <div className="mt-14 grid items-start gap-10 @lg/site:grid-cols-2 @lg/site:gap-14">
            <div className="relative mx-auto w-full max-w-md overflow-hidden pb-12 @sm/site:overflow-visible @sm/site:pb-0">
              <InlineImage
                urlField="imageUrl"
                altField="imageAlt"
                className="relative z-10 overflow-hidden bg-neutral-200 shadow-lg grayscale"
                imgClassName="aspect-[4/3] w-full object-cover"
                emptyLabel="Main photo"
              />
              <InlineImage
                urlField="imageUrl2"
                altField="imageAlt2"
                className="absolute -bottom-6 left-0 z-0 w-[48%] overflow-hidden border-4 border-white shadow-md grayscale @sm/site:-left-8 @sm/site:w-[55%]"
                imgClassName="aspect-[4/3] w-full object-cover"
                emptyLabel="Photo 2"
              />
              <InlineImage
                urlField="imageUrl3"
                altField="imageAlt3"
                className="absolute -bottom-10 right-0 z-20 w-[40%] overflow-hidden border-4 border-white shadow-md grayscale @sm/site:-right-4 @sm/site:w-[42%]"
                imgClassName="aspect-[4/3] w-full object-cover"
                emptyLabel="Photo 3"
              />
            </div>
            <div className="pt-8 lg:pt-2">
              <InlineText
                field="body"
                as="p"
                className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 sm:text-[15px]"
                placeholder="Describe your company…"
                multiline
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "innovation") {
    const cardCount = Array.isArray(d.cards)
      ? (d.cards as unknown[]).length
      : items(d.items).filter((line) => line.trim()).length;
    const hasCopy = cardCount > 0 || true;
    return (
      <section
        style={{ ...themeVars, ...style }}
        className="text-neutral-900"
      >
        <div
          className={`mx-auto grid max-w-6xl gap-10 px-4 py-16 @sm/site:px-8 ${
            hasCopy && cardCount > 0
              ? "@lg/site:grid-cols-2 @lg/site:items-start @lg/site:gap-14"
              : ""
          }`}
        >
          <div className="min-w-0">
            <InlineText
              field="heading"
              as="h2"
              className="text-2xl font-bold tracking-tight @sm/site:text-3xl @lg/site:text-[2.6rem] @lg/site:leading-tight"
              placeholder={fallbackHeading}
              fallback={fallbackHeading}
            />
            <InlineText
              field="body"
              as="p"
              className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600"
              placeholder="Section intro…"
              multiline
            />
            <InlineText
              field="signature"
              as="p"
              className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-800"
              placeholder="Signature name"
            />
            <InlineText
              field="signatureRole"
              as="p"
              className="mt-1 text-[11px] tracking-wide text-neutral-500"
              placeholder="Title / role"
            />
          </div>
          {cardCount > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-4 @md/site:grid-cols-2">
              {Array.from({ length: cardCount }).map((_, i) => (
                <InlineInnovationCard
                  key={i}
                  index={i}
                  fallbackImage={
                    i === 0 ? DEFAULT_WAREHOUSE_IMAGE : DEFAULT_LOGISTICS_IMAGE
                  }
                  renderBrowseImage={(src, alt) => (
                    <LogisticsCardImage
                      src={src}
                      alt={alt}
                      fallback={
                        i === 0
                          ? DEFAULT_WAREHOUSE_IMAGE
                          : DEFAULT_LOGISTICS_IMAGE
                      }
                    />
                  )}
                />
              ))}
              <InlineAddFeatureCard
                label="+ Add card"
                className="min-h-[280px] bg-white shadow-sm"
              />
            </div>
          ) : (
            <InlineAddFeatureCard className="min-h-[200px] max-w-md" />
          )}
        </div>
      </section>
    );
  }

  if (variant === "darkServiceGrid") {
    const parsed = items(d.items).map((line, index) => {
      const [title, description] = line.split("|").map((s) => s.trim());
      return {
        index,
        title: title || line,
        description: description || "",
      };
    });
    const air =
      parsed.find((c) => c.title.toLowerCase() === "air freight") ?? parsed[0];
    const rest = parsed.filter((c) => c !== air);

    const ServiceCard = ({
      index,
      titleForIcon,
      className = "",
    }: {
      index: number;
      titleForIcon: string;
      className?: string;
    }) => {
      return (
        <div
          className={`relative min-h-[200px] border-2 border-white/20 bg-[var(--site-dark-elevated)] p-6 pt-10 transition duration-200 hover:border-[var(--site-accent)] ${className}`}
        >
          <span className="absolute -top-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center bg-[var(--site-dark-elevated)] text-[var(--site-on-dark)] ring-2 ring-[var(--site-accent-soft)]">
            <LogisticsServiceIcon name={titleForIcon} className="h-11 w-11" />
          </span>
          <InlinePipeItemEditor
            field="items"
            index={index}
            wrapperClassName="text-center"
            titleClassName="text-sm font-bold uppercase tracking-[0.14em]"
            descriptionClassName="mt-3 text-xs leading-relaxed text-white/55"
          />
        </div>
      );
    };

    return (
      <section
        className="relative overflow-x-hidden text-white"
        style={{ ...themeVars, ...style }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-8 hidden h-[420px] w-[420px] rounded-full border border-white/5 opacity-40 @lg/site:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 top-24 hidden h-[280px] w-[280px] rounded-full border border-white/5 opacity-30 @md/site:block"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 @sm/site:px-8 @lg/site:grid-cols-[0.85fr_1.35fr] @lg/site:gap-10 @lg/site:py-20">
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-col items-start gap-3 @sm/site:flex-row @sm/site:gap-4">
              <InlineText
                field="heading"
                as="h2"
                className="min-w-0 text-2xl font-bold tracking-tight @sm/site:text-3xl @lg/site:text-[3.35rem] @lg/site:leading-[1.08]"
                placeholder={fallbackHeading}
                fallback={fallbackHeading}
                multiline
              />
              <span
                aria-hidden
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white text-base @sm/site:flex"
              >
                →
              </span>
            </div>
            {air ? (
              <div className="mt-8 w-full max-w-sm @lg/site:mt-10">
                <ServiceCard index={air.index} titleForIcon={air.title} />
              </div>
            ) : null}
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-5 @min-[480px]/site:grid-cols-2">
            {rest.map((card) => (
              <ServiceCard
                key={card.index}
                index={card.index}
                titleForIcon={card.title}
              />
            ))}
            <InlineAddListItem
              field="items"
              template="New service|Service description"
              label="+ Add service"
              className="min-h-[200px] border-2 border-dashed border-white/30 bg-[var(--site-dark-elevated)] text-white"
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "categoryStrip") {
    const cards = parseCategoryCards(d);
    return (
      <section style={{ ...themeVars, ...style }} className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 @sm/site:px-8 @md/site:grid-cols-3 @md/site:gap-6 @md/site:py-14">
          {cards.map((card) => (
            <div key={card.title} className="flex gap-4">
              <div className="h-24 w-20 shrink-0 overflow-hidden bg-white/10 sm:h-28 sm:w-24">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrlForDisplay(card.imageUrl, { publicSite })}
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-white/40">
                    Photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold tracking-wide">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/65">
                  {card.description}
                </p>
                <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-white/90">
                  {card.linkLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "trustBar") {
    const list = items(d.items);
    return (
      <section style={{ ...themeVars, ...style }} className="border-y border-black/8 bg-white text-black">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {list.map((item) => {
            const [title, subtitle] = item.split("|").map((s) => s.trim());
            return (
              <div key={item} className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 rounded-full border border-black/15" />
                <p className="text-[11px] font-bold tracking-[0.16em]">
                  {title || item}
                </p>
                <p className="mt-1 text-xs text-black/55">{subtitle || ""}</p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const list = items(d.items);
  const isFeatures = section.type === "FEATURES";
  return (
    <section style={{ ...themeVars, ...style }} className="mx-auto max-w-6xl">
      <InlineText
        field="heading"
        as="h2"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
        placeholder={fallbackHeading}
        fallback={fallbackHeading}
      />
      {list.length === 0 ? (
        <p className="mt-3 text-sm opacity-70">Add items in the editor.</p>
      ) : (
        <ul
          className={`mt-6 grid gap-4 ${
            isFeatures
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2"
          }`}
        >
          {list.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="rounded-2xl border border-black/8 bg-white/80 p-5 shadow-sm shadow-black/[0.03]"
            >
              <span
                className="mb-3 inline-block h-1.5 w-8 rounded-full"
                style={{ background: "var(--editor-primary)" }}
                aria-hidden
              />
              <InlineSimpleListItem
                field="items"
                index={index}
                className="text-sm font-medium leading-relaxed sm:text-[0.95rem]"
              />
            </li>
          ))}
          <li className="list-none">
            <InlineAddListItem
              field="items"
              template="New item"
              label="+ Add item"
              className="min-h-[100px] rounded-2xl"
            />
          </li>
        </ul>
      )}
    </section>
  );
}

export function GallerySectionView({ section, style, themeVars }: ViewProps) {
  const d = section.data;
  const images = Array.isArray(d.images)
    ? (d.images as { url?: string; alt?: string; title?: string }[])
    : [];
  const withUrl = images.filter((img) => img.url);

  if (variantOf(section) === "productGrid") {
    const slots =
      withUrl.length > 0
        ? withUrl
        : [{ url: "", alt: "Product 1" }, { url: "", alt: "Product 2" }, { url: "", alt: "Product 3" }, { url: "", alt: "Product 4" }];
    return (
      <section id="products" style={{ ...themeVars, ...style }} className="bg-white text-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <InlineText
              field="heading"
              as="h2"
              className="text-2xl font-black tracking-tight sm:text-3xl"
              fallback="BEST OF BRAND"
            />
            <InlineText
              field="viewAllLabel"
              as="span"
              className="text-[11px] font-semibold tracking-[0.16em] text-black/60"
              fallback="VIEW ALL"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="group relative bg-[#efeff1]">
                <span className="absolute right-3 top-3 z-10 text-sm text-black/50">♡</span>
                <InlineGallerySlot
                  index={i}
                  className="aspect-[3/4] w-full"
                  imgClassName="aspect-[3/4] w-full object-cover"
                  emptyLabel={`Product ${i + 1}`}
                />
              </div>
            ))}
            <InlineAddGalleryPhoto
              label="+ Add product"
              className="aspect-[3/4] min-h-0"
            />
          </div>
        </div>
      </section>
    );
  }

  const slotCount = Math.max(withUrl.length, 4);
  return (
    <section style={{ ...themeVars, ...style }}>
      <InlineText
        field="heading"
        as="h2"
        className="text-xl font-semibold"
        fallback="Gallery"
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: slotCount }).map((_, i) => (
          <InlineGallerySlot
            key={i}
            index={i}
            className="aspect-[4/3] w-full overflow-hidden rounded-lg"
            imgClassName="aspect-[4/3] w-full rounded-lg object-cover"
            emptyLabel={`Photo ${i + 1}`}
          />
        ))}
        <InlineAddGalleryPhoto
          label="+ Add photo"
          className="aspect-[4/3] min-h-0 rounded-lg"
        />
      </div>
    </section>
  );
}

export function TestimonialsSectionView({ section, style, themeVars }: ViewProps) {
  const d = section.data;
  return (
    <section style={{ ...themeVars, ...style }} className="mx-auto max-w-3xl">
      <InlineText
        field="heading"
        as="h2"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
        fallback="Testimonials"
      />
      <blockquote className="mt-6 rounded-2xl border border-black/8 bg-white/80 p-6 shadow-sm sm:p-8">
        <p className="text-lg leading-relaxed italic opacity-90 sm:text-xl">
          “
          <InlineText field="quote" placeholder="Quote" fallback="Quote" />
          ”
        </p>
        <p
          className="mt-4 text-sm font-semibold"
          style={{ color: "var(--editor-primary)" }}
        >
          — <InlineText field="author" placeholder="Author" fallback="Author" />
        </p>
      </blockquote>
    </section>
  );
}

export function PricingSectionView({ section, style, themeVars }: ViewProps) {
  const d = section.data;
  return (
    <section style={{ ...themeVars, ...style }}>
      <InlineText field="heading" as="h2" className="text-xl font-semibold" fallback="Pricing" />
      <div className="mt-3 rounded-xl border p-4">
        <InlineText field="planName" as="p" className="font-semibold" fallback="Plan" />
        <InlineText
          field="price"
          as="p"
          className="text-2xl font-bold"
          style={{ color: "var(--editor-primary)" }}
          fallback="$0"
        />
        <ul className="mt-2 list-disc pl-5 text-sm">
          {items(d.features).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FaqSectionView({ section, style, themeVars }: ViewProps) {
  const d = section.data;
  const faqs = Array.isArray(d.items)
    ? (d.items as { q?: string; a?: string }[])
    : [];
  return (
    <section style={{ ...themeVars, ...style }}>
      <InlineText field="heading" as="h2" className="text-xl font-semibold" fallback="FAQ" />
      <p className="mt-2 text-xs text-neutral-500">
        Edit individual Q&amp;A in Advanced.
      </p>
      <dl className="mt-3 space-y-3">
        {faqs.map((item, i) => (
          <div key={i}>
            <dt className="font-medium">{str(item.q, "Question?")}</dt>
            <dd className="text-sm opacity-80">{str(item.a, "Answer.")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ContactSectionView({
  section,
  style,
  themeVars,
  inquiryTarget,
}: ViewProps) {
  const d = section.data;
  const fashion = variantOf(section) === "fashion";
  const logistics = variantOf(section) === "logistics";
  const submitLabel = str(d.submitLabel, str(d.buttonText, "Send message"));
  const successMessage = str(
    d.successMessage,
    "Thanks — your message was sent. We’ll reply soon."
  );

  if (logistics) {
    return (
      <section
        id="contact"
        style={{ ...themeVars, ...style }}
        className="scroll-mt-28 text-neutral-900"
      >
        <div className="mx-auto max-w-3xl px-4 py-16 @sm/site:px-8">
          <InlineText
            field="heading"
            as="h2"
            className="text-2xl font-bold tracking-tight @sm/site:text-3xl"
            fallback="Contact us"
          />
          <InlineText
            field="body"
            as="p"
            className="mt-3 text-sm leading-relaxed text-neutral-600 @sm/site:text-base"
            placeholder="Intro text…"
            multiline
          />
          <p className="mt-2 text-sm text-neutral-500">
            Or email us at{" "}
            <InlineText
              field="email"
              as="span"
              className="font-medium text-neutral-800"
              placeholder="hello@company.com"
            />
          </p>
          {inquiryTarget ? (
            <ContactInquiryForm
              target={inquiryTarget}
              submitLabel={submitLabel}
              successMessage={successMessage}
            />
          ) : (
            <p className="mt-6 text-sm text-neutral-500">
              Contact form is available on your live site preview.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      style={{ ...themeVars, ...style }}
      className={fashion ? "bg-white text-black" : "mx-auto max-w-3xl"}
    >
      <div className={fashion ? "mx-auto max-w-7xl px-4 py-14 @sm/site:px-8" : undefined}>
        <InlineText
          field="heading"
          as="h2"
          className={
            fashion
              ? "text-2xl font-black tracking-tight @sm/site:text-3xl"
              : "text-2xl font-semibold tracking-tight @sm/site:text-3xl"
          }
          fallback="Contact"
        />
        {inquiryTarget ? (
          <>
            <InlineText
              field="body"
              as="p"
              className="mt-3 text-base opacity-90"
              placeholder="Intro…"
              multiline
            />
            <ContactInquiryForm
              target={inquiryTarget}
              submitLabel={submitLabel}
              successMessage={successMessage}
            />
          </>
        ) : (
          <>
            <p className="mt-3 text-base opacity-90">
              <InlineText field="email" placeholder="Email address" />
            </p>
            <CtaLink
              href={`mailto:${str(d.email)}`}
              className={
                fashion
                  ? "mt-6 inline-block bg-black px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white"
                  : "mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10"
              }
              style={fashion ? undefined : { background: "var(--editor-primary)" }}
            >
              <InlineText field="buttonText" placeholder="Contact button" />
            </CtaLink>
          </>
        )}
      </div>
    </section>
  );
}

export function ServicesSectionView(props: ViewProps) {
  const variant = variantOf(props.section);
  const id = variant === "darkServiceGrid" ? "unmatched-services" : "services";
  return (
    <div id={id} className="scroll-mt-28">
      <ListSectionView {...props} fallbackHeading="Services" />
    </div>
  );
}

export function FeaturesSectionView(props: ViewProps) {
  const variant = variantOf(props.section);
  const id =
    variant === "whyChoose"
      ? "corporate"
      : variant === "innovation"
        ? "about"
        : "features";
  return (
    <div id={id} className="scroll-mt-28">
      <ListSectionView {...props} fallbackHeading="Features" />
    </div>
  );
}

export function FooterSectionView({
  section,
  style,
  themeVars,
  pageSections = [],
}: ViewProps) {
  const d = section.data;
  if (variantOf(section) === "logistics") {
    const fromPage = pageSections.length > 0;
    const services = fromPage
      ? footerServiceLinksFromSections(pageSections)
      : lines(d.serviceLinks).map(parseFooterLink);
    const quicklinks = fromPage
      ? footerQuickLinksFromSections(pageSections)
      : lines(d.quickLinks).map(parseFooterLink);
    return (
      <footer
        id="footer"
        className="scroll-mt-28 text-white"
        style={{ ...themeVars, ...style }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 @sm/site:px-8 @md/site:grid-cols-2 @lg/site:grid-cols-4">
          <div>
            <CtaLink
              href="#home"
              className="text-sm font-semibold tracking-wide hover:opacity-80"
            >
              <InlineText field="logoText" fallback="Ocean Crown" />
            </CtaLink>
            <InlineText
              field="about"
              as="p"
              className="mt-4 text-xs leading-relaxed text-white/55"
              placeholder="About your company…"
              multiline
            />
            <InlineText
              field="social"
              as="p"
              className="mt-5 text-[11px] tracking-[0.16em] text-white/70"
              placeholder="Social handles"
            />
          </div>
          {services.length > 0 ? (
            <div>
              <InlineText
                field="servicesHeading"
                as="p"
                className="text-[11px] font-bold uppercase tracking-[0.16em]"
                fallback="Services"
              />
              <ul className="mt-4 space-y-2 text-xs text-white/60">
                {services.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <CtaLink
                      href={item.href}
                      className="transition hover:text-white"
                    >
                      {item.label}
                    </CtaLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {quicklinks.length > 0 ? (
            <div>
              <InlineText
                field="quickHeading"
                as="p"
                className="text-[11px] font-bold uppercase tracking-[0.16em]"
                fallback="Quicklinks"
              />
              <ul className="mt-4 space-y-2 text-xs text-white/60">
                {quicklinks.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <CtaLink
                      href={item.href}
                      className="transition hover:text-white"
                    >
                      {item.label}
                    </CtaLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div id="track" className="scroll-mt-28">
            <InlineText
              field="subscribeHeading"
              as="p"
              className="text-[11px] font-bold uppercase tracking-[0.16em]"
              fallback="Subscribe"
            />
            <InlineText
              field="subscribeBody"
              as="p"
              className="mt-4 text-xs leading-relaxed text-white/55"
              placeholder="Newsletter blurb…"
              multiline
            />
            <form
              className="mt-4 flex overflow-hidden border border-white/25"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={str(d.subscribePlaceholder, "Email")}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                className="bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-black"
              >
                <InlineText field="subscribeButton" fallback="Go" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-[11px] text-white/40 sm:px-8">
          <InlineText
            field="copyright"
            fallback="© Ocean Crown Shipping Services LLC"
          />
        </div>
      </footer>
    );
  }

  if (variantOf(section) === "fashion") {
    return (
      <footer style={{ ...themeVars, ...style }} className="bg-black text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xl font-black tracking-[0.2em]">
            {str(d.logoText, str(d.copyright, "BRAND").replace(/^©\s*/, "").split(".")[0] || "BRAND")}
          </p>
          <p className="text-xs tracking-wide text-white/60">{str(d.links)}</p>
          <p className="text-xs text-white/50">{str(d.copyright)}</p>
        </div>
      </footer>
    );
  }
  return (
    <footer style={{ ...themeVars, ...style }} className="border-t border-black/10 text-sm opacity-80">
      <p>{str(d.copyright, "© Company")}</p>
      <p className="mt-1">{str(d.links)}</p>
    </footer>
  );
}
