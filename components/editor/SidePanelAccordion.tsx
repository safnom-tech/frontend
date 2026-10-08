"use client";

import { useId, useState, type ReactNode } from "react";

export function SidePanelAccordion({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="border-b border-card-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-black/[0.03]"
      >
        <span
          className="mt-0.5 shrink-0 text-xs text-muted transition-transform"
          aria-hidden
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▶
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold">{title}</span>
          {summary && !open ? (
            <span className="mt-0.5 block truncate text-[10px] text-muted">
              {summary}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-[10px] font-medium text-brand">
          {open ? "Hide" : "Open"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="px-3 pb-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function DeleteSectionIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${className}`}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
