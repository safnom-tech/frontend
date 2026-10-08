"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AiFieldGenerateButton } from "@/components/editor/ai/AiFieldGenerateButton";
import { InlineFieldChromeProvider } from "@/components/editor/inline/InlineFieldChromeContext";
import { InlineFieldColorPanel } from "@/components/editor/inline/InlineFieldColorPanel";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import {
  applyColorToEntireField,
  applyColorToTextOffsets,
  createTextColorSession,
  getSelectionCharacterOffsets,
  normalizeHexColor,
  restoreSelectionRange,
  saveSelectionRange,
  type TextColorSession,
} from "@/lib/inlineRichText";
import { pickerHex } from "@/lib/fieldTextColors";
import type { FieldContentType } from "@/lib/fieldContentAi";
import type { BusinessContextInput } from "@/types/ai";

export function InlineFieldTextChrome({
  fieldKey,
  multiline,
  editableRef,
  onRichTextUpdated,
  children,
  showAi,
  aiFieldType,
  aiFieldLabel,
  aiCurrentValue,
  aiBusinessContext,
  onAiApply,
  useCurrentAsLengthFloor = true,
}: {
  fieldKey: string;
  multiline: boolean;
  editableRef: RefObject<HTMLElement | null>;
  onRichTextUpdated?: () => void;
  children: ReactNode;
  showAi: boolean;
  aiFieldType?: FieldContentType;
  aiFieldLabel?: string;
  aiCurrentValue?: string;
  aiBusinessContext?: BusinessContextInput;
  onAiApply?: (next: string) => void;
  useCurrentAsLengthFloor?: boolean;
}) {
  const ctx = useSectionInlineEdit();
  const chromeRootRef = useRef<HTMLSpanElement>(null);
  const lastGoodRangeRef = useRef<Range | null>(null);
  const lastGoodOffsetsRef = useRef<{ start: number; end: number } | null>(
    null
  );
  const colorSessionRef = useRef<TextColorSession | null>(null);
  const colorPanelRef = useRef<HTMLDivElement | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [hexInput, setHexInput] = useState("ffffff");
  const [sessionHint, setSessionHint] = useState<"selection" | "whole">("whole");
  const [panelKey, setPanelKey] = useState(0);

  const colorOpenRef = useRef(false);
  colorOpenRef.current = colorOpen;

  const chromeContextValue = useMemo(
    () => ({
      contains: (node: Node | null) =>
        Boolean(node && chromeRootRef.current?.contains(node)),
      isColorPanelOpen: () => colorOpenRef.current,
    }),
    []
  );

  useEffect(() => {
    const root = editableRef.current;
    if (!root || !ctx?.enabled) return;

    function rememberSelection() {
      const el = editableRef.current;
      if (!el) return;
      const range = saveSelectionRange(el);
      if (range && !range.collapsed && range.toString().trim()) {
        lastGoodRangeRef.current = range;
        const offsets = getSelectionCharacterOffsets(el, range);
        if (offsets) lastGoodOffsetsRef.current = offsets;
      }
    }

    root.addEventListener("mouseup", rememberSelection);
    root.addEventListener("keyup", rememberSelection);
    document.addEventListener("selectionchange", rememberSelection);
    return () => {
      root.removeEventListener("mouseup", rememberSelection);
      root.removeEventListener("keyup", rememberSelection);
      document.removeEventListener("selectionchange", rememberSelection);
    };
  }, [ctx?.enabled, editableRef]);

  useEffect(() => {
    if (!colorOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (chromeRootRef.current?.contains(target)) return;
      setColorOpen(false);
      colorSessionRef.current = null;
      const root = editableRef.current;
      if (root) onRichTextUpdated?.();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [colorOpen]);

  if (!ctx?.enabled || !ctx.patchFieldTextColor) {
    return <>{children}</>;
  }
  const patchFieldTextColor = ctx.patchFieldTextColor;

  const settings = ctx.settings;
  const sectionDefault = settings?.textColor ?? ctx.themeTextFallback;
  const fieldOverride = settings?.fieldTextColors?.[fieldKey];
  const pickerValue = pickerHex(
    fieldOverride ?? sectionDefault,
    ctx.themeTextFallback
  );

  function resolveRange() {
    const root = editableRef.current;
    if (!root) return null;
    let range = saveSelectionRange(root);
    if (
      (!range || range.collapsed) &&
      lastGoodRangeRef.current &&
      root.contains(lastGoodRangeRef.current.commonAncestorContainer)
    ) {
      range = lastGoodRangeRef.current.cloneRange();
    }
    return range;
  }

  function beginColorSession(): TextColorSession | null {
    const root = editableRef.current;
    if (!root) return null;
    const session = createTextColorSession(
      root,
      resolveRange(),
      lastGoodOffsetsRef.current
    );
    colorSessionRef.current = session;
    setSessionHint(session.mode);
    return session;
  }

  function applyColor(color: string) {
    const root = editableRef.current;
    if (!root) return;
    const hex = normalizeHexColor(color);
    if (!hex) return;

    const session = colorSessionRef.current;
    if (!session) return;

    if (session.mode === "selection") {
      applyColorToTextOffsets(
        root,
        session.start,
        session.end,
        hex,
        session.snapshotPlain,
        session.snapshotRuns
      );
      onRichTextUpdated?.();
      return;
    }

    applyColorToEntireField(root, hex);
    patchFieldTextColor(fieldKey, hex);
    onRichTextUpdated?.();
  }

  function openColorPanel(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    beginColorSession();
    const initial = pickerHex(pickerValue, sectionDefault);
    setHexInput(initial.replace(/^#/, ""));
    setPanelKey((k) => k + 1);
    setColorOpen(true);
    requestAnimationFrame(() => {
      restoreSelectionRange(lastGoodRangeRef.current);
    });
  }

  function onHexChange(raw: string) {
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexInput(cleaned);
    if (cleaned.length === 6) {
      applyColor(`#${cleaned}`);
    }
  }

  const swatchColor =
    normalizeHexColor(hexInput.length === 6 ? `#${hexInput}` : pickerValue) ??
    pickerValue;

  const toolbarVisible =
    colorOpen
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none group-focus-within/aifield:opacity-100 group-focus-within/aifield:pointer-events-auto";

  return (
    <InlineFieldChromeProvider value={chromeContextValue}>
      <span
        ref={chromeRootRef}
        className={`group/aifield relative max-w-full ${multiline ? "block" : "inline-block align-baseline"}`}
      >
        <span
          className={`absolute bottom-full z-40 mb-0.5 transition duration-150 ${toolbarVisible} ${
            multiline ? "left-1/2 -translate-x-1/2" : "left-0"
          }`}
        >
          <div
            ref={colorPanelRef}
            className="relative inline-flex flex-col items-start"
          >
            <span
              role="toolbar"
              aria-label="Text formatting"
              className="inline-flex max-w-[min(100vw-1.5rem,22rem)] flex-wrap items-center gap-0.5 rounded-lg border border-white/10 bg-neutral-900/95 px-1 py-0.5 shadow-lg backdrop-blur-md"
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("[data-color-control]")) {
                  return;
                }
                e.preventDefault();
              }}
            >
              <button
                type="button"
                data-color-control
                className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-white/10"
                title="Text color"
                onPointerDown={openColorPanel}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded border border-white/25"
                  style={{ backgroundColor: swatchColor }}
                />
                <span className="text-[10px] font-semibold text-white/90">
                  Color
                </span>
              </button>

              {fieldOverride ? (
                <button
                  type="button"
                  className="rounded-md px-1.5 py-1 text-[10px] font-medium text-white/65 hover:bg-white/10 hover:text-white"
                  title="Use section default text color for this line"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setColorOpen(false);
                    colorSessionRef.current = null;
                    const root = editableRef.current;
                    if (root) {
                      applyColorToEntireField(root, sectionDefault);
                      onRichTextUpdated?.();
                    }
                    patchFieldTextColor(fieldKey, undefined);
                  }}
                >
                  Reset
                </button>
              ) : null}

              {showAi && aiFieldType && onAiApply ? (
                <>
                  <span className="mx-0.5 h-4 w-px bg-white/15" aria-hidden />
                <AiFieldGenerateButton
                  variant="inlineToolbar"
                  fieldType={aiFieldType}
                  fieldLabel={aiFieldLabel}
                  currentValue={aiCurrentValue}
                  businessContext={aiBusinessContext}
                  useCurrentAsLengthFloor={useCurrentAsLengthFloor}
                  onApply={onAiApply}
                />
                </>
              ) : null}
            </span>

            {colorOpen ? (
              <InlineFieldColorPanel
                key={panelKey}
                hexInput={hexInput}
                sessionHint={sessionHint}
                swatchColor={swatchColor}
                onHexInputChange={onHexChange}
                onPickColor={applyColor}
              />
            ) : null}
          </div>
        </span>
        {children}
      </span>
    </InlineFieldChromeProvider>
  );
}
