"use client";

import type { AiDesignSectionId } from "@/lib/aiDesignSections";
import { DEFAULT_COMPOSED_SECTION_IMAGE_URL } from "@/lib/composedDefaultImage";

/** Miniature live-style preview (not wireframe). */
export function AiDesignSectionPreview({ id }: { id: AiDesignSectionId }) {
  if (id === "industry-carousel") {
    return <IndustryCarouselPreview />;
  }
  return <ImageAccordionPreview />;
}

function ImageAccordionPreview() {
  return (
    <div className="flex h-full min-h-[11rem] gap-2 bg-white p-2.5 text-left">
      <div className="w-[38%] shrink-0 overflow-hidden rounded-lg bg-neutral-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEFAULT_COMPOSED_SECTION_IMAGE_URL}
          alt=""
          className="h-full min-h-[9rem] w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
        <p className="font-serif text-[11px] font-bold leading-tight text-neutral-900">
          AI picks the next ad.
        </p>
        <p className="font-serif text-[11px] font-bold leading-tight text-neutral-400">
          Senior designers make it.
        </p>
        <p className="mt-0.5 line-clamp-2 text-[6px] leading-snug text-neutral-500">
          Short intro paragraph about your service and how you deliver results.
        </p>
        <div className="mt-1 border-y border-neutral-200">
          {[
            ["01", "The software reads what's selling.", true],
            ["02", "It picks the next ad to make.", false],
            ["03", "A senior designer makes it.", false],
          ].map(([num, title, open]) => (
            <div
              key={String(num)}
              className="flex items-start justify-between gap-1 border-b border-neutral-100 py-1 last:border-0"
            >
              <span className="flex min-w-0 gap-1 text-[6px] font-semibold text-neutral-800">
                <span className="text-neutral-400">{num}</span>
                <span className="truncate">{title}</span>
              </span>
              <span className="shrink-0 text-[8px] text-neutral-400">
                {open ? "−" : "+"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustryCarouselPreview() {
  const cards = ["Logistics", "Delivery", "Construction"];
  return (
    <div className="flex h-full min-h-[11rem] flex-col bg-white p-2.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="max-w-[70%] text-[9px] font-bold leading-snug text-neutral-900">
          Built for the industries that keep the world moving.
        </p>
        <div className="flex shrink-0 gap-0.5">
          <span className="flex h-4 w-4 items-center justify-center rounded border border-neutral-200 text-[8px]">
            ←
          </span>
          <span className="flex h-4 w-4 items-center justify-center rounded border border-neutral-200 text-[8px]">
            →
          </span>
        </div>
      </div>
      <div className="flex flex-1 gap-1.5 overflow-hidden">
        {cards.map((label) => (
          <div
            key={label}
            className="relative min-w-0 flex-1 overflow-hidden rounded-lg bg-neutral-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEFAULT_COMPOSED_SECTION_IMAGE_URL}
              alt=""
              className="h-full min-h-[7rem] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 text-[6px] font-semibold text-white">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
