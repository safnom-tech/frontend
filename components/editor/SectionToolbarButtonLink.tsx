"use client";

import { useMemo, useState } from "react";
import { sectionAnchorId } from "@/components/editor/sections/sectionNav";
import type { PageSection } from "@/types/page";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function SectionToolbarButtonLink({
  pageSections,
  buttonUrl,
  onChange,
}: {
  pageSections: PageSection[];
  buttonUrl?: string;
  onChange: (url: string) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const anchorOptions = useMemo(() => {
    const opts: { id: string; label: string; href: string }[] = [];
    for (const s of pageSections) {
      const anchor = sectionAnchorId(s);
      if (!anchor) continue;
      const heading = str(s.data.heading) || str(s.data.title);
      const label =
        heading.slice(0, 40) ||
        s.type.charAt(0) + s.type.slice(1).toLowerCase();
      opts.push({ id: s.id, label, href: `#${anchor}` });
    }
    return opts;
  }, [pageSections]);

  const current = buttonUrl ?? "";
  const matched = anchorOptions.find((o) => o.href === current);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-card-border bg-white px-2 py-1">
      <span className="text-[10px] font-semibold text-muted">Button link</span>
      <select
        className="max-w-[8rem] rounded border border-card-border bg-white px-1.5 py-0.5 text-[10px] font-medium"
        value={matched?.href ?? (current.startsWith("#") ? "" : "__custom__")}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            setCustomUrl(current.startsWith("http") ? current : "");
            setCustomOpen(true);
            return;
          }
          if (v) onChange(v);
        }}
      >
        <option value="">Choose section…</option>
        {anchorOptions.map((o) => (
          <option key={o.id} value={o.href}>
            {o.label}
          </option>
        ))}
        <option value="__custom__">Website address (URL)…</option>
      </select>
      {customOpen || (!matched && current && !current.startsWith("#")) ? (
        <input
          type="url"
          className="w-28 rounded border border-card-border px-1.5 py-0.5 text-[10px]"
          placeholder="https://…"
          value={customOpen ? customUrl : current}
          onChange={(e) => {
            setCustomUrl(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={() => setCustomOpen(false)}
        />
      ) : null}
    </div>
  );
}
