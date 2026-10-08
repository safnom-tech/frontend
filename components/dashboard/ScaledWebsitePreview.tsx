"use client";

import { useEffect, useRef, useState } from "react";
import { WebsiteRenderer } from "@/components/site/WebsiteRenderer";
import { themeColorKey } from "@/components/editor/sections/sectionStyles";
import type { PageSection } from "@/types/page";
import type { WebsiteTheme } from "@/types/website";

const DESIGN_WIDTH = 1280;

/** Scaled live page inside a card — hover slowly scrolls to reveal the full page. */
export function ScaledWebsitePreview({
  theme,
  sections,
  className = "",
  hovering: hoveringProp,
  emptyMessage = "No preview content",
}: {
  theme: WebsiteTheme;
  sections: PageSection[];
  className?: string;
  hovering?: boolean;
  emptyMessage?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [scrollY, setScrollY] = useState(0);
  const [localHover, setLocalHover] = useState(false);
  const [durationSec, setDurationSec] = useState(10);
  const hovering = hoveringProp ?? localHover;

  const themeKey = themeColorKey(theme);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => {
      const next = frame.clientWidth / DESIGN_WIDTH;
      setScale(next > 0 ? next : 0.3);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [sections.length]);

  useEffect(() => {
    if (!hovering) {
      setScrollY(0);
      return;
    }
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content || scale <= 0) return;

    const visibleUnscaled = frame.clientHeight / scale;
    const maxScroll = Math.max(0, content.scrollHeight - visibleUnscaled);
    setScrollY(maxScroll);
    setDurationSec(Math.max(6, Math.min(18, maxScroll / 90)));
  }, [hovering, scale, sections, themeKey]);

  return (
    <div
      ref={frameRef}
      className={`group relative overflow-hidden bg-white ${className}`}
      onMouseEnter={() => {
        if (hoveringProp === undefined) setLocalHover(true);
      }}
      onMouseLeave={() => {
        if (hoveringProp === undefined) setLocalHover(false);
      }}
    >
      {sections.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-muted">
          {emptyMessage}
        </div>
      ) : (
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            transform: `scale(${scale})`,
          }}
        >
          <div
            ref={contentRef}
            style={{
              transform: `translateY(${hovering ? -scrollY : 0}px)`,
              transition: hovering
                ? `transform ${durationSec}s linear`
                : "transform 0.55s ease-out",
            }}
          >
            <WebsiteRenderer
              key={themeKey}
              theme={theme}
              sections={sections}
              emptyMessage={emptyMessage}
            />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/35 to-transparent px-2 py-1.5 opacity-0 transition group-hover:opacity-100">
        <p className="text-[10px] font-medium text-white">
          Hover to scroll full page
        </p>
      </div>
    </div>
  );
}
