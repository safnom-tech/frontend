"use client";

import { useRef } from "react";
import {
  ComposedInlineArrayItemText,
  ComposedInlineCarouselSlideImage,
  ComposedInlineText,
} from "@/components/editor/sections/composed/ComposedInlineField";

export function ComposedIndustryCarousel({
  nodePath,
  slides,
  showNav,
}: {
  nodePath: number[];
  slides: unknown[];
  showNav: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(280, el.clientWidth * 0.75);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <ComposedInlineText
          nodePath={nodePath}
          prop="title"
          as="h2"
          placeholder="Section heading"
          className="max-w-2xl text-2xl font-bold leading-tight text-[var(--site-text)] md:text-3xl"
        />
        {showNav ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--site-text)]/15 bg-white text-lg hover:bg-black/[0.04]"
              onClick={() => scrollByDir(-1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--site-text)]/15 bg-white text-lg hover:bg-black/[0.04]"
              onClick={() => scrollByDir(1)}
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => {
          const row = slide as {
            title?: string;
            icon?: string;
            imageUrl?: string;
          };
          const icon = typeof row.icon === "string" ? row.icon : "◆";
          return (
            <div
              key={i}
              className="relative w-[min(72vw,16rem)] shrink-0 snap-start overflow-hidden rounded-2xl bg-[var(--site-muted-bg)] aspect-[3/4]"
            >
              <ComposedInlineCarouselSlideImage
                nodePath={nodePath}
                index={i}
                className="absolute inset-0 h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="pointer-events-none absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-base shadow">
                {icon}
              </span>
              <p className="absolute bottom-4 left-4 right-4 text-base font-semibold text-white">
                <ComposedInlineArrayItemText
                  nodePath={nodePath}
                  arrayProp="slides"
                  index={i}
                  itemField="title"
                  placeholder={row.title || "Industry"}
                  className="text-white"
                />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
