"use client";

import { useCallback, useRef, useState } from "react";
import { normalizeHexColor } from "@/lib/inlineRichText";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hsvToHex(h: number, s: number, v: number): string {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toByte = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const norm = normalizeHexColor(hex) ?? "#ffffff";
  const r = parseInt(norm.slice(1, 3), 16) / 255;
  const g = parseInt(norm.slice(3, 5), 16) / 255;
  const b = parseInt(norm.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, v: v * 100 };
}

export function InlineFieldColorPanel({
  hexInput,
  sessionHint,
  swatchColor,
  onHexInputChange,
  onPickColor,
}: {
  hexInput: string;
  sessionHint: "selection" | "whole";
  swatchColor: string;
  onHexInputChange: (raw: string) => void;
  onPickColor: (hex: string) => void;
}) {
  const svRef = useRef<HTMLDivElement | null>(null);
  const [hue, setHue] = useState(() => hexToHsv(swatchColor).h);

  const pickSv = useCallback(
    (clientX: number, clientY: number) => {
      const el = svRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      const s = x * 100;
      const v = (1 - y) * 100;
      const hex = hsvToHex(hue, s, v);
      onPickColor(hex);
      onHexInputChange(hex.replace(/^#/, ""));
    },
    [hue, onHexInputChange, onPickColor]
  );

  function onHueChange(nextHue: number) {
    setHue(nextHue);
    const { s, v } = hexToHsv(
      normalizeHexColor(hexInput.length === 6 ? `#${hexInput}` : swatchColor) ??
        swatchColor
    );
    const hex = hsvToHex(nextHue, s, v);
    onPickColor(hex);
    onHexInputChange(hex.replace(/^#/, ""));
  }

  function startSvDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pickSv(e.clientX, e.clientY);
  }

  function moveSvDrag(e: React.PointerEvent) {
    if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    pickSv(e.clientX, e.clientY);
  }

  const hueColor = hsvToHex(hue, 100, 100);

  return (
    <div
      className="absolute left-0 top-full z-50 mt-1 w-[13.5rem] rounded-lg border border-white/10 bg-neutral-900 p-2.5 shadow-xl"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-[10px] leading-snug text-white/70">
        {sessionHint === "selection"
          ? "Applying to highlighted words only"
          : "Applying to the whole line"}
      </p>

      <div
        ref={svRef}
        className="relative h-28 w-full cursor-crosshair rounded-md border border-white/15"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }}
        onPointerDown={startSvDrag}
        onPointerMove={moveSvDrag}
        role="presentation"
      />

      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(hue)}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onHueChange(Number(e.target.value))}
      />

      <label className="mt-2 block text-[10px] font-semibold text-white/80">
        Hex
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="h-8 w-8 shrink-0 rounded-md border border-white/20"
            style={{ backgroundColor: swatchColor }}
          />
          <span className="text-sm font-medium text-white/90">#</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={6}
            className="min-w-0 flex-1 rounded-md border border-white/15 bg-black/40 px-2 py-1.5 font-mono text-sm uppercase text-white outline-none focus:border-brand/60"
            value={hexInput}
            placeholder="FFFFFF"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => onHexInputChange(e.target.value)}
          />
        </div>
      </label>
    </div>
  );
}
