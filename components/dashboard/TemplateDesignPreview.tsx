"use client";

import type { TemplateSummary } from "@/types/template";

/** Mini visual mock of the Ocean Crown logistics theme. */
export function TemplateDesignPreview({
  templateId,
  className = "",
}: {
  templateId: string;
  className?: string;
}) {
  if (templateId !== "ocean-crown") {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-xs text-muted ${className}`}
      >
        Theme
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-neutral-900 text-white ${className}`}
    >
      <div className="flex items-center justify-between bg-black px-2 py-1.5">
        <span className="text-[6px] font-semibold tracking-wide">Ocean Crown</span>
        <span className="text-[5px] text-white/70">TRACK</span>
      </div>
      <div className="relative flex h-[42%] flex-col items-center justify-center bg-gradient-to-b from-neutral-700 to-neutral-900 px-2">
        <span className="text-[5px] tracking-[0.2em] text-white/70">SHIPS ANYTHING</span>
        <span className="mt-0.5 text-center text-[9px] font-black uppercase leading-tight tracking-wide">
          Around the World
        </span>
        <span className="mt-1 rounded-full border border-white/50 px-2 py-0.5 text-[4px] tracking-wider">
          QUOTE
        </span>
      </div>
      <div className="grid grid-cols-5 gap-px bg-neutral-300">
        {["AIR", "LAND", "SEA", "PRJ", "AGY"].map((label, i) => (
          <div
            key={label}
            className={`flex h-6 items-center justify-center text-[4px] font-bold ${
              i === 3 ? "bg-neutral-600 text-white" : "bg-white text-neutral-800"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="bg-white px-2 py-2">
        <div className="mx-auto mb-1 h-1 w-10 bg-neutral-800" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-8 bg-neutral-200" />
          <div className="space-y-0.5 pt-0.5">
            <div className="h-1 w-full bg-neutral-200" />
            <div className="h-1 w-[80%] bg-neutral-200" />
            <div className="h-1 w-[90%] bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function templateAccent(template: TemplateSummary): string {
  if (template.id === "ocean-crown") return "#1a1a1a";
  return "#3da6ad";
}
