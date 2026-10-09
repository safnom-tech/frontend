"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type FocusEvent,
} from "react";
import {
  commitValueFromEditable,
  isRichTextFieldContent,
  plainTextFromInlineField,
  sanitizeInlineFieldHtml,
} from "@/lib/inlineRichText";
import { useInlineFieldChromeBlurGuard } from "@/components/editor/inline/InlineFieldChromeContext";
import { InlineFieldTextChrome } from "@/components/editor/inline/InlineFieldTextChrome";
import { useEditorBusinessContext } from "@/components/editor/ai/useEditorBusinessContext";
import { resolveInlineTextColor } from "@/lib/fieldTextColors";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import {
  fieldTypeSupportsAiGeneration,
  type FieldContentType,
} from "@/lib/fieldContentAi";
import { inferFieldContentType } from "@/lib/inferFieldContentType";
import { usePublicSiteMedia } from "@/contexts/PublicSiteMediaContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as mediaApi from "@/services/media.api";

function fieldStr(data: Record<string, unknown>, field: string, fallback = "") {
  const v = data[field];
  return typeof v === "string" ? v : fallback;
}

const editRing =
  "cursor-text rounded-sm outline-none ring-2 ring-transparent transition hover:ring-brand/35 focus:ring-brand/60 empty:before:text-white/40 empty:before:content-[attr(data-placeholder)]";

export function InlineText({
  field,
  className = "",
  style,
  as,
  placeholder = "",
  multiline = false,
  fallback = "",
  aiFieldType,
  aiFieldLabel,
}: {
  field: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  placeholder?: string;
  multiline?: boolean;
  /** Shown on the live page when the field is empty (not in edit mode). */
  fallback?: string;
  aiFieldType?: FieldContentType;
  aiFieldLabel?: string;
}) {
  const ctx = useSectionInlineEdit();
  const businessContext = useEditorBusinessContext();
  const Tag = (as ?? (multiline ? "p" : "span")) as ElementType;
  if (!ctx) {
    const shown = fallback;
    if (!shown) return null;
    return (
      <Tag className={className} style={style}>
        {shown}
      </Tag>
    );
  }
  const value = fieldStr(ctx.data, field);
  const textColor = resolveInlineTextColor(field, ctx.settings);
  const rich = isRichTextFieldContent(value);
  const mergedStyle =
    !rich && textColor != null ? { ...style, color: textColor } : style;
  const editableRef = useRef<HTMLElement>(null);

  if (!ctx.enabled) {
    const shown = value || fallback;
    if (!shown) return null;
    if (isRichTextFieldContent(shown)) {
      return (
        <Tag
          className={className}
          style={style}
          data-safnom-field={field}
          dangerouslySetInnerHTML={{
            __html: sanitizeInlineFieldHtml(shown),
          }}
        />
      );
    }
    return (
      <Tag
        className={className}
        style={mergedStyle}
        data-safnom-field={field}
      >
        {shown}
      </Tag>
    );
  }

  const resolvedAiType = aiFieldType ?? inferFieldContentType(field, multiline);
  const showAi = fieldTypeSupportsAiGeneration(resolvedAiType);

  const inner = (
    <EditableTextInner
      ref={editableRef}
      Tag={Tag}
      className={`${className} ${editRing}${multiline ? " whitespace-pre-wrap" : ""}`}
      style={mergedStyle}
      value={value}
      placeholder={placeholder}
      multiline={multiline}
      field={field}
      onCommit={(next) => ctx.patch(field, next)}
    />
  );

  return (
    <InlineFieldTextChrome
      fieldKey={field}
      multiline={multiline}
      editableRef={editableRef}
      onRichTextUpdated={() => {
        const el = editableRef.current;
        if (el) ctx.patch(field, commitValueFromEditable(el));
      }}
      showAi={showAi}
      aiFieldType={resolvedAiType}
      aiFieldLabel={aiFieldLabel}
      aiCurrentValue={plainTextFromInlineField(value) || value}
      aiBusinessContext={businessContext}
      onAiApply={(next) => ctx.patch(field, next)}
    >
      {inner}
    </InlineFieldTextChrome>
  );
}

/** Same color + AI chrome as `InlineText`, but value/commit are controlled by the parent (e.g. pipe card lines). */
export function InlineSubfieldText({
  fieldKey,
  value,
  onCommit,
  className = "",
  style,
  as,
  placeholder = "",
  multiline = false,
  aiFieldType,
  aiFieldLabel,
}: {
  fieldKey: string;
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  placeholder?: string;
  multiline?: boolean;
  aiFieldType?: FieldContentType;
  aiFieldLabel?: string;
}) {
  const ctx = useSectionInlineEdit();
  const businessContext = useEditorBusinessContext();
  const Tag = (as ?? (multiline ? "p" : "span")) as ElementType;
  if (!ctx?.enabled) return null;

  const textColor = resolveInlineTextColor(fieldKey, ctx.settings);
  const rich = isRichTextFieldContent(value);
  const mergedStyle =
    !rich && textColor != null ? { ...style, color: textColor } : style;
  const editableRef = useRef<HTMLElement>(null);

  const resolvedAiType =
    aiFieldType ?? inferFieldContentType(fieldKey, multiline);
  const showAi = fieldTypeSupportsAiGeneration(resolvedAiType);

  const inner = (
    <EditableTextInner
      ref={editableRef}
      Tag={Tag}
      className={`${className} ${editRing}${multiline ? " whitespace-pre-wrap" : ""}`}
      style={mergedStyle}
      value={value}
      placeholder={placeholder}
      multiline={multiline}
      field={fieldKey}
      onCommit={onCommit}
    />
  );

  return (
    <InlineFieldTextChrome
      fieldKey={fieldKey}
      multiline={multiline}
      editableRef={editableRef}
      onRichTextUpdated={() => {
        const el = editableRef.current;
        if (el) onCommit(commitValueFromEditable(el));
      }}
      showAi={showAi}
      aiFieldType={resolvedAiType}
      aiFieldLabel={aiFieldLabel}
      aiCurrentValue={plainTextFromInlineField(value) || value}
      aiBusinessContext={businessContext}
      useCurrentAsLengthFloor={false}
      onAiApply={onCommit}
    >
      {inner}
    </InlineFieldTextChrome>
  );
}

const EditableTextInner = forwardRef(function EditableTextInner(
  {
    Tag,
    className,
    style,
    value,
    placeholder,
    multiline,
    field,
    onCommit,
  }: {
    Tag: ElementType;
    className: string;
    style?: CSSProperties;
    value: string;
    placeholder: string;
    multiline: boolean;
    field?: string;
    onCommit: (value: string) => void;
  },
  ref: React.ForwardedRef<HTMLElement>
) {
  const blurGuard = useInlineFieldChromeBlurGuard();
  const innerRef = useRef<HTMLElement>(null);
  const setRef = (el: HTMLElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el || document.activeElement === el) return;
    if (isRichTextFieldContent(value)) {
      el.innerHTML = sanitizeInlineFieldHtml(value);
    } else if (multiline) {
      el.innerText = value || "";
    } else {
      el.textContent = value || "";
    }
  }, [value, multiline]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !field) return;
    if (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("safnom-focus-field") === field
    ) {
      window.sessionStorage.removeItem("safnom-focus-field");
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [field]);

  return (
    <Tag
      ref={setRef as never}
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={style}
      data-safnom-field={field}
      data-placeholder={placeholder}
      onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        if (blurGuard?.isColorPanelOpen()) return;
        const next = e.relatedTarget;
        if (next instanceof Node && blurGuard?.contains(next)) return;
        onCommit(commitValueFromEditable(e.currentTarget));
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
});

export function InlineImage({
  urlField,
  altField = "imageAlt",
  className = "",
  imgClassName = "h-full w-full object-cover",
  emptyLabel = "Add image",
  children,
}: {
  urlField: string;
  altField?: string;
  className?: string;
  imgClassName?: string;
  emptyLabel?: string;
  children?: ReactNode;
}) {
  const ctx = useSectionInlineEdit();
  const { currentWorkspace } = useWorkspace();
  const publicSite = usePublicSiteMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!ctx) {
    if (children) return <>{children}</>;
    return null;
  }
  const url = fieldStr(ctx.data, urlField);
  const alt = fieldStr(ctx.data, altField);
  const displayUrl = url
    ? mediaApi.mediaUrlForDisplay(url, { publicSite })
    : "";

  if (!ctx.enabled) {
    if (displayUrl) {
      return (
        <div className={className}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt={alt} className={imgClassName} />
        </div>
      );
    }
    if (children) return <>{children}</>;
    if (ctx.showCanvasChrome) {
      return (
        <div
          className={`flex min-h-[6rem] items-center justify-center border border-dashed border-black/15 bg-black/[0.04] text-center text-xs text-neutral-500 ${className}`}
        >
          {emptyLabel}
        </div>
      );
    }
    return null;
  }

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      ctx!.patch(urlField, res.data.url);
      if (!alt.trim()) {
        ctx!.patch(
          altField,
          res.data.originalFilename.replace(/\.[^.]+$/, "")
        );
      }
    } catch (err) {
      setUploadError(
        err instanceof ApiClientError ? err.message : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={`group/inlineimg relative ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={alt || "Image"} className={imgClassName} />
      ) : (
        <div
          className={`flex min-h-[8rem] flex-col items-center justify-center border-2 border-dashed border-brand/40 bg-black/20 text-center text-xs text-white/70 ${imgClassName.includes("object") ? "" : "w-full"}`}
        >
          {emptyLabel}
        </div>
      )}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/50 p-2 opacity-0 transition group-hover/inlineimg:opacity-100 group-focus-within/inlineimg:opacity-100">
        <button
          type="button"
          disabled={uploading}
          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow hover:bg-neutral-100 disabled:opacity-60"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : displayUrl ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          className="rounded-full border border-white/80 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/20"
          onClick={() => setPickerOpen(true)}
        >
          Library
        </button>
        {displayUrl ? (
          <button
            type="button"
            className="rounded-full border border-red-200/80 bg-red-950/40 px-3 py-1.5 text-[11px] font-semibold text-red-100 hover:bg-red-950/60"
            onClick={() => ctx.patchMany({ [urlField]: "", [altField]: alt })}
          >
            Remove
          </button>
        ) : null}
      </div>
      {uploadError ? (
        <p className="absolute bottom-1 left-1 right-1 rounded bg-red-950/90 px-2 py-1 text-[10px] text-red-100">
          {uploadError}
        </p>
      ) : null}
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
        onSelect={(media) => {
          ctx.patch(urlField, media.url);
          if (!alt.trim()) {
            ctx.patch(
              altField,
              media.originalFilename.replace(/\.[^.]+$/, "")
            );
          }
        }}
      />
      {children}
    </div>
  );
}

function arrayAt(data: Record<string, unknown>, field: string, index: number) {
  if (!Array.isArray(data[field])) return "";
  const row = (data[field] as unknown[])[index];
  return typeof row === "string" ? row : "";
}

/** Edits one entry in a string array field (e.g. pillars, nav labels). */
export function InlineArrayText({
  field,
  index,
  className = "",
  as,
  placeholder = "",
  fallback = "",
}: {
  field: string;
  index: number;
  className?: string;
  as?: ElementType;
  placeholder?: string;
  fallback?: string;
}) {
  const ctx = useSectionInlineEdit();
  if (!ctx) {
    if (!fallback) return null;
    const Tag = (as ?? "span") as ElementType;
    return <Tag className={className}>{fallback}</Tag>;
  }
  const value = arrayAt(ctx.data, field, index);
  const fieldKey = `${field}.${index}`;
  const textColor = resolveInlineTextColor(fieldKey, ctx.settings);
  const rich = isRichTextFieldContent(value);
  const mergedStyle =
    !rich && textColor != null ? { color: textColor } : undefined;
  const editableRef = useRef<HTMLElement>(null);

  if (!ctx.enabled) {
    const shown = value || fallback;
    if (!shown) return null;
    const Tag = (as ?? "span") as ElementType;
    if (isRichTextFieldContent(shown)) {
      return (
        <Tag
          className={className}
          data-safnom-field={fieldKey}
          dangerouslySetInnerHTML={{
            __html: sanitizeInlineFieldHtml(shown),
          }}
        />
      );
    }
    return (
      <Tag
        className={className}
        style={mergedStyle}
        data-safnom-field={fieldKey}
      >
        {shown}
      </Tag>
    );
  }

  const businessContext = useEditorBusinessContext();
  const resolvedAiType = inferFieldContentType(field, false);
  const showAi = fieldTypeSupportsAiGeneration(resolvedAiType);

  const inner = (
    <EditableTextInner
      ref={editableRef}
      Tag={(as ?? "span") as ElementType}
      className={`${className} ${editRing}`}
      style={mergedStyle}
      value={value}
      placeholder={placeholder}
      multiline={false}
      field={fieldKey}
      onCommit={(next) => ctx.patchArrayItem(field, index, next)}
    />
  );

  return (
    <InlineFieldTextChrome
      fieldKey={fieldKey}
      multiline={false}
      editableRef={editableRef}
      onRichTextUpdated={() => {
        const el = editableRef.current;
        if (el) ctx.patchArrayItem(field, index, commitValueFromEditable(el));
      }}
      showAi={showAi}
      aiFieldType={resolvedAiType}
      aiCurrentValue={plainTextFromInlineField(value) || value}
      aiBusinessContext={businessContext}
      useCurrentAsLengthFloor={false}
      onAiApply={(next) => ctx.patchArrayItem(field, index, next)}
    >
      {inner}
    </InlineFieldTextChrome>
  );
}

/** Edits gallery.images[index].url with upload overlay. */
export function InlineGallerySlot({
  index,
  className = "",
  imgClassName = "h-full w-full object-cover",
  emptyLabel = "Add photo",
}: {
  index: number;
  className?: string;
  imgClassName?: string;
  emptyLabel?: string;
}) {
  const ctx = useSectionInlineEdit();
  const { currentWorkspace } = useWorkspace();
  const publicSite = usePublicSiteMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!ctx) return null;

  const images = ctx.data.images;
  const row =
    Array.isArray(images) && images[index]
      ? (images[index] as { url?: string; alt?: string })
      : { url: "", alt: "" };
  const url = typeof row.url === "string" ? row.url : "";
  const alt = typeof row.alt === "string" ? row.alt : "";
  const displayUrl = url
    ? mediaApi.mediaUrlForDisplay(url, { publicSite })
    : "";

  if (!ctx.enabled) {
    if (displayUrl) {
      return (
        <div className={className}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt={alt} className={imgClassName} />
        </div>
      );
    }
    if (ctx.showCanvasChrome) {
      return (
        <div
          className={`flex min-h-[6rem] items-center justify-center border border-dashed border-black/15 bg-black/[0.04] text-xs text-neutral-500 ${className}`}
        >
          {emptyLabel}
        </div>
      );
    }
    return null;
  }

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      ctx!.patchGalleryImage(index, {
        url: res.data.url,
        alt: alt || res.data.originalFilename.replace(/\.[^.]+$/, ""),
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={`group/inlineimg relative ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={alt || "Gallery"} className={imgClassName} />
      ) : (
        <div className="flex h-full min-h-[6rem] w-full flex-col items-center justify-center border-2 border-dashed border-brand/40 bg-black/10 text-center text-xs text-neutral-600">
          {emptyLabel}
        </div>
      )}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/50 p-2 opacity-0 transition group-hover/inlineimg:opacity-100">
        <button
          type="button"
          disabled={uploading}
          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : displayUrl ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          className="rounded-full border border-white/80 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white"
          onClick={() => setPickerOpen(true)}
        >
          Library
        </button>
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
        onSelect={(media) => {
          ctx.patchGalleryImage(index, {
            url: media.url,
            alt: alt || media.originalFilename.replace(/\.[^.]+$/, ""),
          });
        }}
      />
    </div>
  );
}
