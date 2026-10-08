"use client";

import { useEffect, useRef, useState } from "react";
import { TemplateLivePreview } from "@/components/dashboard/TemplateLivePreview";
import type { WebsiteTheme } from "@/types/website";

/**
 * Defers template preview API + render until the card is near the viewport.
 * Keeps theme grids cheap when hundreds of themes are listed.
 */
export function LazyTemplateLivePreview({
  templateId,
  className = "",
  hovering,
  themeOverride,
  rootMargin = "200px",
}: {
  templateId: string;
  className?: string;
  hovering?: boolean;
  themeOverride?: WebsiteTheme;
  rootMargin?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, templateId]);

  return (
    <div ref={rootRef} className={`h-full w-full ${className}`}>
      {visible ? (
        <TemplateLivePreview
          templateId={templateId}
          className="h-full w-full"
          hovering={hovering}
          themeOverride={themeOverride}
        />
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center bg-[var(--dash-main,#eef1f4)] text-xs text-muted">
          Preview loads when visible…
        </div>
      )}
    </div>
  );
}
