"use client";

import { useRef, useState, type ReactNode } from "react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import {
  InlineArrayText,
  InlineSubfieldText,
} from "@/components/editor/inline/InlineField";
import {
  featureCardPartFieldKey,
  pipeItemPartFieldKey,
} from "@/lib/fieldTextColors";
import {
  isRichTextFieldContent,
  sanitizeInlineFieldHtml,
} from "@/lib/inlineRichText";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { confirmAction } from "@/lib/confirm";
import * as mediaApi from "@/services/media.api";

const editRing =
  "cursor-text rounded-sm outline-none ring-2 ring-transparent transition hover:ring-brand/35 focus:ring-brand/60";

function parsePipeLine(line: string): { title: string; description: string } {
  const parts = line.split("|").map((s) => s.trim());
  const title = parts[0] || "";
  const description = parts.slice(1).join("|").trim();
  return { title, description };
}

function arrayAt(data: Record<string, unknown>, field: string, index: number) {
  if (!Array.isArray(data[field])) return "";
  const row = (data[field] as unknown[])[index];
  return typeof row === "string" ? row : "";
}

export function InlinePillarCell({
  index,
  textClassName,
  placeholder,
}: {
  index: number;
  textClassName?: string;
  placeholder?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx) return null;
  return (
    <div className="relative text-center">
      <InlineCardDeleteButton
        onDelete={() => ctx.removeArrayItemAt("pillars", index)}
      />
      <span className="mx-auto mb-3 block h-4 w-4 rounded-full border-2 border-neutral-400 bg-white" />
      <InlineArrayText
        field="pillars"
        index={index}
        as="p"
        className={textClassName ?? ""}
        placeholder={placeholder}
      />
    </div>
  );
}

export function InlineCardDeleteButton({
  onDelete,
  className = "",
}: {
  onDelete: () => void;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx?.enabled) return null;
  return (
    <button
      type="button"
      title="Remove"
      aria-label="Remove card"
      className={`absolute right-1 top-1 z-[70] rounded-full bg-red-600/95 px-2 py-0.5 text-[10px] font-bold text-white shadow hover:bg-red-700 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        void (async () => {
          if (
            !(await confirmAction({
              title: "Remove item?",
              message: "This item will be removed from the list.",
              confirmLabel: "Remove",
              tone: "danger",
            }))
          ) {
            return;
          }
          onDelete();
        })();
      }}
    >
      Remove
    </button>
  );
}

/** Editable title + description for `items` lines formatted as Title|Description */
export function InlinePipeItemEditor({
  field,
  index,
  titleClassName = "",
  descriptionClassName = "",
  children,
  wrapperClassName = "",
}: {
  field: string;
  index: number;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
  wrapperClassName?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx) return null;

  const line = arrayAt(ctx.data, field, index);
  const { title, description } = parsePipeLine(line);

  function renderStaticText(text: string, className: string) {
    if (!text) return null;
    if (isRichTextFieldContent(text)) {
      return (
        <p
          className={className}
          dangerouslySetInnerHTML={{
            __html: sanitizeInlineFieldHtml(text),
          }}
        />
      );
    }
    return <p className={className}>{text}</p>;
  }

  if (!ctx.enabled) {
    return (
      <div className={wrapperClassName}>
        {children}
        {renderStaticText(title, titleClassName)}
        {renderStaticText(description, descriptionClassName)}
      </div>
    );
  }

  const editCtx = ctx;

  function siblingPart(part: "title" | "description") {
    const line = arrayAt(editCtx.data, field, index);
    return parsePipeLine(line)[part];
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      <InlineCardDeleteButton
        onDelete={() => editCtx.removeArrayItemAt(field, index)}
      />
      {children}
      <InlineSubfieldText
        fieldKey={pipeItemPartFieldKey(field, index, "title")}
        value={title}
        as="p"
        className={titleClassName}
        placeholder="Title"
        aiFieldType="title"
        aiFieldLabel="Card title"
        onCommit={(nextTitle) =>
          editCtx.patchPipeItem(
            field,
            index,
            nextTitle,
            siblingPart("description")
          )
        }
      />
      <InlineSubfieldText
        fieldKey={pipeItemPartFieldKey(field, index, "description")}
        value={description}
        as="p"
        multiline
        className={descriptionClassName}
        placeholder="Description"
        aiFieldType="description"
        aiFieldLabel="Card description"
        onCommit={(nextDesc) =>
          editCtx.patchPipeItem(field, index, siblingPart("title"), nextDesc)
        }
      />
    </div>
  );
}

/** Single-line item in a list (features/services default list) */
export function InlineSimpleListItem({
  field,
  index,
  className = "",
}: {
  field: string;
  index: number;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx) return null;
  const value = arrayAt(ctx.data, field, index);

  if (!ctx.enabled) {
    return <p className={className}>{value}</p>;
  }

  return (
    <div className="relative">
      <InlineCardDeleteButton
        onDelete={() => ctx.removeArrayItemAt(field, index)}
      />
      <p
        contentEditable
        suppressContentEditableWarning
        className={`${className} ${editRing}`}
        onClick={(e) => e.stopPropagation()}
        onBlur={(e) =>
          ctx.patchArrayItem(field, index, e.currentTarget.innerText.trim())
        }
      >
        {value || "List item"}
      </p>
    </div>
  );
}

type FeatureCard = { title: string; body: string; imageUrl: string };

function featureCards(data: Record<string, unknown>): FeatureCard[] {
  if (Array.isArray(data.cards) && (data.cards as unknown[]).length > 0) {
    return (data.cards as Record<string, unknown>[]).map((c) => ({
      title: typeof c.title === "string" ? c.title : "",
      body: typeof c.body === "string" ? c.body : "",
      imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
    }));
  }
  if (!Array.isArray(data.items)) return [];
  return (data.items as unknown[]).map((line) => {
    const parts = String(line)
      .split("|")
      .map((s) => s.trim());
    return {
      title: parts[0] || "",
      body: parts[1] || "",
      imageUrl: parts[2] || "",
    };
  });
}

export function InlineInnovationCard({
  index,
  fallbackImage,
  renderBrowseImage,
}: {
  index: number;
  fallbackImage: string;
  renderBrowseImage: (src: string | undefined, alt: string) => ReactNode;
}) {
  const ctx = useSectionInlineEdit();
  const cards = ctx ? featureCards(ctx.data) : [];
  const card = cards[index] ?? { title: "", body: "", imageUrl: "" };

  if (!ctx?.enabled) {
    return (
      <article className="flex min-w-0 flex-col border border-neutral-200/90 bg-white p-4 shadow-sm shadow-black/5">
        {renderBrowseImage(card.imageUrl, card.title || "Feature")}
        {card.title ? (
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em]">
            {card.title}
          </h3>
        ) : null}
        {card.body ? (
          <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-600">
            {card.body}
          </p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="relative flex min-w-0 flex-col border border-neutral-200/90 bg-white p-4 shadow-sm shadow-black/5">
      <InlineCardDeleteButton
        onDelete={() => ctx.removeFeatureCardAt(index)}
      />
      <InlineFeatureCardImage
        index={index}
        alt={card.title}
        fallback={fallbackImage}
      />
      <InlineSubfieldText
        fieldKey={featureCardPartFieldKey(index, "title")}
        value={card.title}
        as="h3"
        className="text-[11px] font-bold uppercase tracking-[0.16em]"
        placeholder="Title"
        aiFieldType="title"
        aiFieldLabel="Card title"
        onCommit={(next) => ctx.patchFeatureCardAt(index, { title: next })}
      />
      <InlineSubfieldText
        fieldKey={featureCardPartFieldKey(index, "body")}
        value={card.body}
        as="p"
        multiline
        className="mt-2 flex-1 text-xs leading-relaxed text-neutral-600"
        placeholder="Description"
        aiFieldType="description"
        aiFieldLabel="Card description"
        onCommit={(next) => ctx.patchFeatureCardAt(index, { body: next })}
      />
    </article>
  );
}

function InlineFeatureCardImage({
  index,
  alt,
  fallback,
}: {
  index: number;
  alt: string;
  fallback: string;
}) {
  const ctx = useSectionInlineEdit();
  const { currentWorkspace } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!ctx?.enabled) return null;
  const editCtx = ctx;

  const cards = featureCards(editCtx.data);
  const url = cards[index]?.imageUrl ?? "";
  const displayUrl = url ? mediaApi.mediaUrlForDisplay(url) : fallback;

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      editCtx.patchFeatureCardAt(index, { imageUrl: res.data.url });
    } catch (err) {
      console.error(err instanceof ApiClientError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="group/cardimg relative mb-3"
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayUrl}
        alt={alt || "Card"}
        className="aspect-[16/10] w-full object-cover grayscale"
      />
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/50 p-2 opacity-0 transition group-hover/cardimg:opacity-100">
        <button
          type="button"
          disabled={uploading}
          className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-neutral-900"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          className="rounded-full border border-white/80 px-3 py-1 text-[10px] font-semibold text-white"
          onClick={() => setPickerOpen(true)}
        >
          Library
        </button>
        {url ? (
          <button
            type="button"
            className="rounded-full bg-red-700/90 px-3 py-1 text-[10px] font-semibold text-white"
            onClick={() => editCtx.patchFeatureCardAt(index, { imageUrl: "" })}
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => void onPickFile(e.target.files?.[0])}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) =>
          editCtx.patchFeatureCardAt(index, { imageUrl: media.url })
        }
      />
    </div>
  );
}

/** Menu line: Title|$price|Description */
export function InlineMenuLineEditor({
  field,
  index,
  variant = "list",
  titleClassName = "",
  priceClassName = "",
  descriptionClassName = "",
}: {
  field: string;
  index: number;
  variant?: "list" | "featured";
  titleClassName?: string;
  priceClassName?: string;
  descriptionClassName?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx) return null;
  const editCtx = ctx;

  const line = arrayAt(editCtx.data, field, index);
  const parts = line.split("|").map((s) => s.trim());
  const title = parts[0] || "";
  const price = parts[1]?.startsWith("$") ? parts[1] : "";
  const description = price ? parts[2] || "" : parts[1] || "";

  if (!editCtx.enabled) {
    if (variant === "featured") {
      return (
        <>
          <div className="mt-2 flex flex-wrap items-baseline justify-center gap-3">
            <h3 className={titleClassName}>{title}</h3>
            {price ? <span className={priceClassName}>{price}</span> : null}
          </div>
          {description ? (
            <p className={`mt-3 ${descriptionClassName}`}>{description}</p>
          ) : null}
        </>
      );
    }
    return (
      <>
        <div className="flex items-baseline gap-2">
          <h3 className={`shrink-0 ${titleClassName}`}>{title}</h3>
          <span
            aria-hidden
            className="min-w-4 flex-1 border-b border-dotted border-[#c9a24a]/35"
          />
          {price ? (
            <span className={`shrink-0 ${priceClassName}`}>{price}</span>
          ) : null}
        </div>
        {description ? (
          <p className={`mt-1.5 ${descriptionClassName}`}>{description}</p>
        ) : null}
      </>
    );
  }

  function commit(nextTitle: string, nextPrice: string, nextDesc: string) {
    const p = nextPrice.trim();
    const d = nextDesc.trim();
    const t = nextTitle.trim();
    if (p) {
      editCtx.patchArrayItem(field, index, `${t}|${p}|${d}`);
    } else {
      editCtx.patchArrayItem(field, index, d ? `${t}|${d}` : t);
    }
  }

  return (
    <div className="relative">
      <InlineCardDeleteButton
        onDelete={() => editCtx.removeArrayItemAt(field, index)}
      />
      <div
        className={
          variant === "featured"
            ? "flex flex-wrap items-baseline justify-center gap-3"
            : "flex items-baseline gap-2"
        }
      >
        <InlineSubfieldText
          fieldKey={`${field}.${index}.title`}
          value={title}
          as="span"
          className={titleClassName}
          placeholder="Dish name"
          aiFieldType="title"
          aiFieldLabel="Item title"
          onCommit={(nextTitle) => commit(nextTitle, price, description)}
        />
        {variant === "list" ? (
          <span
            aria-hidden
            className="min-w-4 flex-1 border-b border-dotted border-[#c9a24a]/35"
          />
        ) : null}
        <span
          contentEditable
          suppressContentEditableWarning
          className={`${priceClassName} ${editRing}`}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) =>
            commit(title, e.currentTarget.innerText, description)
          }
        >
          {price || "$0"}
        </span>
      </div>
      <InlineSubfieldText
        fieldKey={`${field}.${index}.description`}
        value={description}
        as="p"
        multiline
        className={`${variant === "featured" ? "mt-3" : "mt-1.5"} ${descriptionClassName}`}
        placeholder="Description"
        aiFieldType="description"
        aiFieldLabel="Item description"
        onCommit={(nextDesc) => commit(title, price, nextDesc)}
      />
    </div>
  );
}
