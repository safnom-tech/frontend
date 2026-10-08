"use client";

import type { MouseEvent, ReactNode } from "react";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";

const addTileClass =
  "flex min-h-[120px] w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-brand/45 bg-brand/[0.06] px-3 py-6 text-center text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/10";

export function InlineAddTile({
  label = "+ Add",
  onAdd,
  className = "",
  children,
}: {
  label?: string;
  onAdd: () => void;
  className?: string;
  children?: ReactNode;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx?.enabled) return null;

  return (
    <button
      type="button"
      className={`${addTileClass} ${className}`}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onAdd();
      }}
    >
      {children ?? label}
    </button>
  );
}

export function InlineAddListItem({
  field,
  template,
  label = "+ Add item",
  className = "",
}: {
  field: string;
  template: string;
  label?: string;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx?.enabled) return null;
  return (
    <InlineAddTile
      label={label}
      className={className}
      onAdd={() => ctx.appendArrayItem(field, template)}
    />
  );
}

export function InlineAddGalleryPhoto({
  label = "+ Add photo",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx?.enabled) return null;
  return (
    <InlineAddTile
      label={label}
      className={className}
      onAdd={() => ctx.appendGallerySlot()}
    />
  );
}

export function InlineAddFeatureCard({
  label = "+ Add card",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx?.enabled) return null;
  return (
    <InlineAddTile
      label={label}
      className={className}
      onAdd={() => ctx.appendFeatureCard()}
    />
  );
}
