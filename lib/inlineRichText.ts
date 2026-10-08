/** True when stored value uses inline color spans. */
export function isRichTextFieldContent(value: string): boolean {
  if (!value || !value.includes("<")) return false;
  return /<span\s/i.test(value);
}

export function plainTextFromInlineField(value: string): string {
  if (!isRichTextFieldContent(value)) return value;
  if (typeof document === "undefined") {
    return value.replace(/<[^>]+>/g, "");
  }
  const div = document.createElement("div");
  div.innerHTML = sanitizeInlineFieldHtml(value);
  return (div.textContent ?? "").trim();
}

/** Allow only span wrappers with a color style. */
export function sanitizeInlineFieldHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") {
    return html.replace(/<(?!\/?span\b)[^>]+>/gi, "");
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    if (el.tagName !== "SPAN") {
      return Array.from(el.childNodes).map(walk).join("");
    }
    const color = el.style.color;
    const inner = Array.from(el.childNodes).map(walk).join("");
    if (!color) return inner;
    const hex = rgbToHex(color);
    if (!hex) return inner;
    return `<span style="color: ${hex}">${inner}</span>`;
  };
  return Array.from(div.childNodes).map(walk).join("");
}

function rgbToHex(color: string): string | null {
  if (color.startsWith("#")) {
    return color.length >= 4 ? color : null;
  }
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function saveSelectionRange(
  root: HTMLElement | null
): Range | null {
  const sel = window.getSelection();
  if (!root || !sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

export function restoreSelectionRange(range: Range | null) {
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

/** Color highlighted text inside root; returns true if selection was styled. */
export function commitValueFromEditable(el: HTMLElement): string {
  const html = el.innerHTML;
  if (/<span[\s>]/i.test(html)) {
    return sanitizeInlineFieldHtml(html);
  }
  return (el.innerText ?? "").trim();
}

export const INLINE_COLOR_MARK = "data-safnom-inline-color";

export function findInlineColorMark(root: HTMLElement): HTMLElement | null {
  return root.querySelector(`[${INLINE_COLOR_MARK}]`);
}

function wrapRangeWithColor(range: Range, color: string): boolean {
  const span = document.createElement("span");
  span.style.color = color;
  span.setAttribute(INLINE_COLOR_MARK, "1");
  try {
    range.surroundContents(span);
    return true;
  } catch {
    try {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
      return true;
    } catch {
      return false;
    }
  }
}

export function hasNonCollapsedTextSelection(
  root: HTMLElement,
  savedRange: Range | null
): savedRange is Range {
  if (!savedRange || savedRange.collapsed) return false;
  if (!root.contains(savedRange.commonAncestorContainer)) return false;
  return (savedRange.toString().trim().length ?? 0) > 0;
}

export function applyColorToDomSelection(
  root: HTMLElement,
  color: string,
  savedRange: Range | null
): boolean {
  if (!savedRange || savedRange.collapsed) return false;
  if (!root.contains(savedRange.commonAncestorContainer)) return false;

  root.focus();
  const range = savedRange.cloneRange();
  const ok = wrapRangeWithColor(range, color);
  if (ok) {
    const sel = window.getSelection();
    sel?.removeAllRanges();
  }
  return ok;
}

/** Uniform color for every character in the field (no selection). */
export function applyColorToEntireField(
  root: HTMLElement,
  color: string
): void {
  root.querySelectorAll(`[${INLINE_COLOR_MARK}]`).forEach((el) => {
    el.removeAttribute(INLINE_COLOR_MARK);
  });
  const plain = (root.innerText ?? "").trimEnd();
  root.textContent = plain || root.textContent || "";
  root.style.color = color;
}

export type ColorPickMode = "selection" | "whole";

export function resolveColorPickMode(
  root: HTMLElement,
  range: Range | null
): ColorPickMode {
  return getSelectionCharacterOffsets(root, range) ? "selection" : "whole";
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function normalizeHexColor(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[0]!;
    const g = raw[1]!;
    const b = raw[2]!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

/** Character offsets in `root.innerText` for the given range. */
export function getSelectionCharacterOffsets(
  root: HTMLElement,
  range: Range | null
): { start: number; end: number } | null {
  if (!range || range.collapsed) return null;
  if (!root.contains(range.commonAncestorContainer)) return null;
  const selected = range.toString();
  if (!selected.trim()) return null;

  const pre = document.createRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const end = start + selected.length;
  if (end <= start) return null;
  return { start, end };
}

export type InlineTextRun = { text: string; color?: string };

export function parseColoredRunsFromRoot(root: HTMLElement): InlineTextRun[] {
  const runs: InlineTextRun[] = [];
  function walk(node: Node, inheritedColor?: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) runs.push({ text, color: inheritedColor });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    let color = inheritedColor;
    if (el.tagName === "SPAN" && el.style.color) {
      const hex = rgbToHex(el.style.color);
      if (hex) color = hex;
    }
    el.childNodes.forEach((child) => walk(child, color));
  }
  root.childNodes.forEach((child) => walk(child));
  return runs;
}

function runsPlainText(runs: InlineTextRun[]): string {
  return runs.map((r) => r.text).join("");
}

function applyColorToRuns(
  runs: InlineTextRun[],
  start: number,
  end: number,
  color: string
): InlineTextRun[] {
  if (end <= start) return runs;
  let pos = 0;
  const out: InlineTextRun[] = [];
  for (const run of runs) {
    const runStart = pos;
    const runEnd = pos + run.text.length;
    pos = runEnd;
    if (runEnd <= start || runStart >= end) {
      out.push(run);
      continue;
    }
    const sliceStart = Math.max(start, runStart) - runStart;
    const sliceEnd = Math.min(end, runEnd) - runStart;
    const before = run.text.slice(0, sliceStart);
    const mid = run.text.slice(sliceStart, sliceEnd);
    const after = run.text.slice(sliceEnd);
    if (before) out.push({ text: before, color: run.color });
    if (mid) out.push({ text: mid, color });
    if (after) out.push({ text: after, color: run.color });
  }
  return out;
}

function runsToInlineHtml(runs: InlineTextRun[]): string {
  return runs
    .map((run) => {
      const escaped = escapeHtmlText(run.text);
      if (run.color) {
        return `<span style="color:${run.color}">${escaped}</span>`;
      }
      return escaped;
    })
    .join("");
}

/** Color only [start,end) in snapshotPlain; keeps other inline colors from snapshotRuns. */
export function applyColorToTextOffsets(
  root: HTMLElement,
  start: number,
  end: number,
  color: string,
  snapshotPlain: string,
  snapshotRuns?: InlineTextRun[]
): void {
  const plain = snapshotPlain;
  const safeStart = Math.max(0, Math.min(start, plain.length));
  const safeEnd = Math.max(safeStart, Math.min(end, plain.length));
  const baseColor = root.style.color;

  let runs = snapshotRuns;
  if (runs && runsPlainText(runs) !== plain) {
    runs = undefined;
  }
  if (!runs || runs.length === 0) {
    runs = [{ text: plain }];
  }

  const nextRuns = applyColorToRuns(runs, safeStart, safeEnd, color);
  root.innerHTML = runsToInlineHtml(nextRuns);
  if (baseColor) {
    root.style.color = baseColor;
  }
}

export type TextColorSession =
  | { mode: "whole" }
  | {
      mode: "selection";
      start: number;
      end: number;
      snapshotPlain: string;
      snapshotRuns: InlineTextRun[];
    };

export function createTextColorSession(
  root: HTMLElement,
  range: Range | null,
  frozenOffsets?: { start: number; end: number } | null
): TextColorSession {
  const offsets =
    getSelectionCharacterOffsets(root, range) ?? frozenOffsets ?? null;
  if (offsets) {
    const snapshotPlain = root.innerText;
    return {
      mode: "selection",
      start: offsets.start,
      end: offsets.end,
      snapshotPlain,
      snapshotRuns: parseColoredRunsFromRoot(root),
    };
  }
  return { mode: "whole" };
}
