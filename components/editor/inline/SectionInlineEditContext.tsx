"use client";

import {
  cloneSection,
  removeNodeAtPath,
} from "@/components/editor/sections/composed/composedTreeEdit";
import type { ComposedSectionDefinition } from "@/types/composed-section";
import { parseComposedSectionFromData } from "@/types/composed-section";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { SectionStyleSettings } from "@/types/editor";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => String(x));
  return [];
}

type SectionInlineEditContextValue = {
  /** True when the block is selected and inline typing/upload is active. */
  enabled: boolean;
  /** Show empty image slots on the editor canvas (not on live preview). */
  showCanvasChrome: boolean;
  data: Record<string, unknown>;
  patch: (field: string, value: string) => void;
  patchMany: (fields: Record<string, string>) => void;
  patchArrayItem: (field: string, index: number, value: string) => void;
  patchGalleryImage: (
    index: number,
    partial: { url?: string; alt?: string }
  ) => void;
  appendArrayItem: (field: string, value: string) => void;
  appendGallerySlot: () => void;
  appendFeatureCard: () => void;
  removeArrayItemAt: (field: string, index: number) => void;
  patchPipeItem: (
    field: string,
    index: number,
    title: string,
    description: string
  ) => void;
  patchFeatureCardAt: (
    index: number,
    partial: { title?: string; body?: string; imageUrl?: string }
  ) => void;
  removeFeatureCardAt: (index: number) => void;
  patchComposedSection?: (
    updater: (section: ComposedSectionDefinition) => ComposedSectionDefinition
  ) => void;
  removeComposedNode?: (path: number[]) => void;
  settings: SectionStyleSettings;
  themeTextFallback: string;
  patchFieldTextColor: (fieldKey: string, color: string | undefined) => void;
};

const SectionInlineEditContext =
  createContext<SectionInlineEditContextValue | null>(null);

export function SectionInlineEditProvider({
  active = false,
  showCanvasChrome = false,
  data,
  onChange,
  settings = {},
  themeTextFallback = "#1a3a4a",
  onSettingsPatch,
  children,
}: {
  active?: boolean;
  showCanvasChrome?: boolean;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  settings?: SectionStyleSettings;
  themeTextFallback?: string;
  onSettingsPatch?: (patch: Partial<SectionStyleSettings>) => void;
  children: ReactNode;
}) {
  const patch = useCallback(
    (field: string, value: string) => {
      if (!active) return;
      onChange({ ...data, [field]: value });
    },
    [active, data, onChange]
  );

  const patchMany = useCallback(
    (fields: Record<string, string>) => {
      if (!active) return;
      onChange({ ...data, ...fields });
    },
    [active, data, onChange]
  );

  const patchArrayItem = useCallback(
    (field: string, index: number, value: string) => {
      if (!active) return;
      const arr = asStringArray(data[field]);
      const next = [...arr];
      while (next.length <= index) next.push("");
      next[index] = value;
      onChange({ ...data, [field]: next });
    },
    [active, data, onChange]
  );

  const patchGalleryImage = useCallback(
    (index: number, partial: { url?: string; alt?: string }) => {
      if (!active) return;
      const raw = data.images;
      const list = Array.isArray(raw)
        ? (raw as { url?: string; alt?: string }[]).map((img) => ({
            url: typeof img.url === "string" ? img.url : "",
            alt: typeof img.alt === "string" ? img.alt : "",
          }))
        : [];
      while (list.length <= index) list.push({ url: "", alt: "" });
      list[index] = { ...list[index], ...partial };
      onChange({ ...data, images: list });
    },
    [active, data, onChange]
  );

  const appendArrayItem = useCallback(
    (field: string, value: string) => {
      if (!active) return;
      const arr = asStringArray(data[field]);
      onChange({ ...data, [field]: [...arr, value] });
    },
    [active, data, onChange]
  );

  const appendGallerySlot = useCallback(() => {
    if (!active) return;
    const raw = data.images;
    const list = Array.isArray(raw)
      ? (raw as { url?: string; alt?: string }[]).map((img) => ({
          url: typeof img.url === "string" ? img.url : "",
          alt: typeof img.alt === "string" ? img.alt : "",
        }))
      : [];
    onChange({ ...data, images: [...list, { url: "", alt: "" }] });
  }, [active, data, onChange]);

  const appendFeatureCard = useCallback(() => {
    if (!active) return;
    const raw = data.cards;
    const list = Array.isArray(raw)
      ? (raw as Record<string, unknown>[]).map((c) => ({
          title: typeof c.title === "string" ? c.title : "",
          body: typeof c.body === "string" ? c.body : "",
          imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
        }))
      : [];
    onChange({
      ...data,
      cards: [
        ...list,
        { title: "New feature", body: "Description", imageUrl: "" },
      ],
    });
  }, [active, data, onChange]);

  const removeArrayItemAt = useCallback(
    (field: string, index: number) => {
      if (!active) return;
      const arr = asStringArray(data[field]);
      onChange({
        ...data,
        [field]: arr.filter((_, i) => i !== index),
      });
    },
    [active, data, onChange]
  );

  const patchPipeItem = useCallback(
    (field: string, index: number, title: string, description: string) => {
      if (!active) return;
      const line = description.trim()
        ? `${title.trim()}|${description.trim()}`
        : title.trim();
      const arr = asStringArray(data[field]);
      const next = [...arr];
      while (next.length <= index) next.push("");
      next[index] = line;
      onChange({ ...data, [field]: next });
    },
    [active, data, onChange]
  );

  const patchFeatureCardAt = useCallback(
    (
      index: number,
      partial: { title?: string; body?: string; imageUrl?: string }
    ) => {
      if (!active) return;
      const raw = data.cards;
      const list = Array.isArray(raw)
        ? (raw as Record<string, unknown>[]).map((c) => ({
            title: typeof c.title === "string" ? c.title : "",
            body: typeof c.body === "string" ? c.body : "",
            imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
          }))
        : [];
      while (list.length <= index) {
        list.push({ title: "", body: "", imageUrl: "" });
      }
      list[index] = { ...list[index], ...partial };
      onChange({ ...data, cards: list });
    },
    [active, data, onChange]
  );

  const removeFeatureCardAt = useCallback(
    (index: number) => {
      if (!active) return;
      const raw = data.cards;
      const list = Array.isArray(raw)
        ? (raw as Record<string, unknown>[]).map((c) => ({
            title: typeof c.title === "string" ? c.title : "",
            body: typeof c.body === "string" ? c.body : "",
            imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
          }))
        : [];
      onChange({
        ...data,
        cards: list.filter((_, i) => i !== index),
      });
    },
    [active, data, onChange]
  );

  const patchComposedSection = useCallback(
    (updater: (section: ComposedSectionDefinition) => ComposedSectionDefinition) => {
      if (!active) return;
      const parsed = parseComposedSectionFromData(data);
      if (!parsed) return;
      const nextSection = updater(cloneSection(parsed));
      onChange({
        ...data,
        schemaVersion: 1,
        section: nextSection,
      });
    },
    [active, data, onChange]
  );

  const removeComposedNode = useCallback(
    (path: number[]) => {
      if (!active || path.length === 0) return;
      patchComposedSection((section) => ({
        ...section,
        root: removeNodeAtPath(section.root, path),
      }));
    },
    [active, patchComposedSection]
  );

  const patchFieldTextColor = useCallback(
    (fieldKey: string, color: string | undefined) => {
      if (!active || !onSettingsPatch) return;
      const prev = { ...(settings.fieldTextColors ?? {}) };
      if (!color) {
        delete prev[fieldKey];
      } else {
        prev[fieldKey] = color;
      }
      onSettingsPatch({
        fieldTextColors:
          Object.keys(prev).length > 0 ? prev : undefined,
      });
    },
    [active, onSettingsPatch, settings.fieldTextColors]
  );

  const value = useMemo(
    (): SectionInlineEditContextValue => ({
      enabled: active,
      showCanvasChrome,
      data,
      settings,
      themeTextFallback,
      patchFieldTextColor,
      patch,
      patchMany,
      patchArrayItem,
      patchGalleryImage,
      appendArrayItem,
      appendGallerySlot,
      appendFeatureCard,
      removeArrayItemAt,
      patchPipeItem,
      patchFeatureCardAt,
      removeFeatureCardAt,
      patchComposedSection,
      removeComposedNode,
    }),
    [
      active,
      showCanvasChrome,
      data,
      settings,
      themeTextFallback,
      patchFieldTextColor,
      patch,
      patchMany,
      patchArrayItem,
      patchGalleryImage,
      appendArrayItem,
      appendGallerySlot,
      appendFeatureCard,
      removeArrayItemAt,
      patchPipeItem,
      patchFeatureCardAt,
      removeFeatureCardAt,
      patchComposedSection,
      removeComposedNode,
    ]
  );

  return (
    <SectionInlineEditContext.Provider value={value}>
      {children}
    </SectionInlineEditContext.Provider>
  );
}

export function useSectionInlineEdit() {
  return useContext(SectionInlineEditContext);
}
