"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  commitValueFromEditable,
  isRichTextFieldContent,
  sanitizeInlineFieldHtml,
} from "@/lib/inlineRichText";
import { useInlineFieldChromeBlurGuard } from "@/components/editor/inline/InlineFieldChromeContext";
import { InlineFieldTextChrome } from "@/components/editor/inline/InlineFieldTextChrome";
import { useEditorBusinessContext } from "@/components/editor/ai/useEditorBusinessContext";
import {
  composedNodeFieldKey,
  resolveInlineTextColor,
} from "@/lib/fieldTextColors";
import { ComposedImageLightbox } from "@/components/editor/sections/composed/ComposedImageLightbox";
import { DEFAULT_COMPOSED_SECTION_IMAGE_URL } from "@/lib/composedDefaultImage";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import {
  fieldTypeSupportsAiGeneration,
  type FieldContentType,
} from "@/lib/fieldContentAi";
import {
  getNodeAtPath,
  updateNodeProp,
} from "@/components/editor/sections/composed/composedTreeEdit";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as mediaApi from "@/services/media.api";
import { parseComposedSectionFromData } from "@/types/composed-section";

const editRing =
  "cursor-text rounded-sm outline-none ring-2 ring-transparent transition hover:ring-brand/35 focus:ring-brand/60 empty:before:text-[var(--site-text)]/40 empty:before:content-[attr(data-placeholder)]";

function inferComposedPropFieldType(prop: string, multiline: boolean): FieldContentType {
  if (prop === "label") return "button";
  if (prop === "text") return multiline ? "description" : "heading";
  if (prop === "submitLabel") return "button";
  if (prop === "name") return "generic";
  return multiline ? "description" : "generic";
}

function withInlineTextTools(
  fieldKey: string,
  multiline: boolean,
  fieldType: FieldContentType,
  fieldLabel: string | undefined,
  value: string,
  onApply: (next: string) => void,
  editableRef: RefObject<HTMLElement | null>,
  onRichTextUpdated: () => void,
  inner: ReactNode
) {
  const businessContext = useEditorBusinessContext();
  const showAi = fieldTypeSupportsAiGeneration(fieldType);
  return (
    <InlineFieldTextChrome
      fieldKey={fieldKey}
      multiline={multiline}
      editableRef={editableRef}
      onRichTextUpdated={onRichTextUpdated}
      showAi={showAi}
      aiFieldType={fieldType}
      aiFieldLabel={fieldLabel}
      aiCurrentValue={value}
      aiBusinessContext={businessContext}
      onAiApply={onApply}
    >
      {inner}
    </InlineFieldTextChrome>
  );
}

function renderComposedStaticText(
  Tag: ElementType,
  className: string,
  style: CSSProperties | undefined,
  shown: string
) {
  if (isRichTextFieldContent(shown)) {
    return (
      <Tag
        className={className}
        style={style}
        dangerouslySetInnerHTML={{
          __html: sanitizeInlineFieldHtml(shown),
        }}
      />
    );
  }
  return (
    <Tag className={className} style={style}>
      {shown}
    </Tag>
  );
}

export function ComposedInlineText({
  nodePath,
  prop,
  className = "",
  style,
  as,
  placeholder = "",
  multiline = false,
  fallback = "",
}: {
  nodePath: number[];
  prop: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  placeholder?: string;
  multiline?: boolean;
  fallback?: string;
}) {
  const ctx = useSectionInlineEdit();
  const Tag = (as ?? (multiline ? "p" : "span")) as ElementType;
  const composed = ctx ? parseComposedSectionFromData(ctx.data) : null;
  const node = composed ? getNodeAtPath(composed.root, nodePath) : null;
  const value =
    typeof node?.props?.[prop] === "string" ? String(node.props[prop]) : "";

  const fieldKey = composedNodeFieldKey(nodePath, prop);
  const textColor = ctx ? resolveInlineTextColor(fieldKey, ctx.settings) : undefined;
  const rich = isRichTextFieldContent(value);
  const mergedStyle =
    !rich && textColor != null ? { ...style, color: textColor } : style;
  const editableRef = useRef<HTMLElement>(null);

  if (!ctx) {
    const shown = value || fallback;
    if (!shown) return null;
    return renderComposedStaticText(Tag, className, mergedStyle, shown);
  }

  if (!ctx.enabled || !ctx.patchComposedSection) {
    const shown = value || fallback;
    if (!shown) return null;
    return renderComposedStaticText(Tag, className, mergedStyle, shown);
  }

  const apply = (next: string) => {
    ctx.patchComposedSection?.((section) => ({
      ...section,
      root: updateNodeProp(section.root, nodePath, prop, next),
    }));
  };

  return withInlineTextTools(
    fieldKey,
    multiline,
    inferComposedPropFieldType(prop, multiline),
    placeholder || prop,
    value,
    apply,
    editableRef,
    () => {
      const el = editableRef.current;
      if (el) apply(commitValueFromEditable(el));
    },
    <EditableText
      ref={editableRef}
      Tag={Tag}
      className={`${className} ${editRing}${multiline ? " whitespace-pre-wrap" : ""}`}
      style={mergedStyle}
      value={value}
      placeholder={placeholder}
      multiline={multiline}
      onCommit={apply}
    />
  );
}

const EditableText = forwardRef(function EditableText(
  {
    Tag,
    className,
    style,
    value,
    placeholder,
    multiline,
    onCommit,
  }: {
    Tag: ElementType;
    className: string;
    style?: CSSProperties;
    value: string;
    placeholder: string;
    multiline: boolean;
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

  function commit() {
    const el = innerRef.current;
    if (!el) return;
    onCommit(commitValueFromEditable(el));
  }

  return (
    <Tag
      ref={setRef as never}
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        if (blurGuard?.isColorPanelOpen()) return;
        const next = e.relatedTarget;
        if (next instanceof Node && blurGuard?.contains(next)) return;
        commit();
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      onFocus={(e: FocusEvent) => {
        if (!value && placeholder && !isRichTextFieldContent(value)) {
          e.currentTarget.textContent = "";
        }
      }}
    />
  );
});

export function ComposedInlineArrayItemText({
  nodePath,
  arrayProp,
  index,
  itemField,
  className = "",
  placeholder = "",
}: {
  nodePath: number[];
  arrayProp: string;
  index: number;
  itemField: string;
  className?: string;
  placeholder?: string;
}) {
  const ctx = useSectionInlineEdit();
  const composed = ctx ? parseComposedSectionFromData(ctx.data) : null;
  const node = composed ? getNodeAtPath(composed.root, nodePath) : null;
  const items = Array.isArray(node?.props?.[arrayProp])
    ? (node!.props![arrayProp] as Record<string, unknown>[])
    : [];
  const row = items[index];
  const value = typeof row?.[itemField] === "string" ? String(row[itemField]) : "";

  const fieldKey = composedNodeFieldKey(
    nodePath,
    `${arrayProp}.${index}.${itemField}`
  );
  const textColor = ctx
    ? resolveInlineTextColor(fieldKey, ctx.settings)
    : undefined;
  const rich = isRichTextFieldContent(value);
  const mergedStyle =
    !rich && textColor != null ? { color: textColor } : undefined;
  const editableRef = useRef<HTMLElement>(null);

  if (!ctx?.enabled || !ctx.patchComposedSection) {
    return value
      ? renderComposedStaticText("span", className, mergedStyle, value)
      : null;
  }

  const apply = (next: string) => {
    ctx.patchComposedSection?.((section) => {
      const current = getNodeAtPath(section.root, nodePath);
      const list = Array.isArray(current?.props?.[arrayProp])
        ? [...(current!.props![arrayProp] as Record<string, unknown>[])]
        : [];
      list[index] = { ...list[index], [itemField]: next };
      return {
        ...section,
        root: updateNodeProp(section.root, nodePath, arrayProp, list),
      };
    });
  };

  const fieldType: FieldContentType =
    itemField === "body"
      ? "description"
      : itemField === "value"
        ? "generic"
        : itemField === "title"
          ? "heading"
          : "subheading";

  return withInlineTextTools(
    fieldKey,
    itemField === "body",
    fieldType,
    itemField,
    value,
    apply,
    editableRef,
    () => {
      const el = editableRef.current;
      if (el) apply(commitValueFromEditable(el));
    },
    <EditableText
      ref={editableRef}
      Tag="span"
      className={`${className} ${editRing}`}
      style={mergedStyle}
      value={value}
      placeholder={placeholder}
      multiline={itemField === "body"}
      onCommit={apply}
    />
  );
}

export function ComposedInlineGalleryImage({
  nodePath,
  index,
  className = "",
}: {
  nodePath: number[];
  index: number;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  const composed = ctx ? parseComposedSectionFromData(ctx.data) : null;
  const node = composed ? getNodeAtPath(composed.root, nodePath) : null;
  const images = Array.isArray(node?.props?.images)
    ? (node!.props!.images as { url?: string; alt?: string }[])
    : [];
  const row = images[index] ?? {};
  const url = row.url ?? "";
  const alt = row.alt ?? "";

  function patchImage(nextUrl: string, nextAlt?: string) {
    ctx?.patchComposedSection?.((section) => {
      const current = getNodeAtPath(section.root, nodePath);
      const list = Array.isArray(current?.props?.images)
        ? [...(current!.props!.images as { url?: string; alt?: string }[])]
        : [];
      while (list.length <= index) list.push({ url: "", alt: "" });
      list[index] = {
        url: nextUrl,
        alt: nextAlt ?? list[index]?.alt ?? "",
      };
      return {
        ...section,
        root: updateNodeProp(section.root, nodePath, "images", list),
      };
    });
  }

  return (
    <ComposedInlineImage
      nodePath={nodePath}
      className={className}
      emptyLabel="Gallery image"
      readUrl={url}
      readAlt={alt}
      onPatch={patchImage}
    />
  );
}

export function ComposedInlineImage({
  nodePath,
  className = "",
  imgClassName = "w-full rounded-xl object-cover aspect-[4/5]",
  emptyLabel = "Add photo",
  readUrl,
  readAlt,
  onPatch,
}: {
  nodePath: number[];
  className?: string;
  imgClassName?: string;
  emptyLabel?: string;
  readUrl?: string;
  readAlt?: string;
  onPatch?: (url: string, alt?: string) => void;
}) {
  const ctx = useSectionInlineEdit();
  const { currentWorkspace } = useWorkspace();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const composed = ctx ? parseComposedSectionFromData(ctx.data) : null;
  const node = composed ? getNodeAtPath(composed.root, nodePath) : null;
  const props = (node?.props ?? {}) as Record<string, unknown>;
  const url =
    readUrl ?? (typeof props.url === "string" ? props.url : "");
  const alt =
    readAlt ?? (typeof props.alt === "string" ? props.alt : "");
  const displayUrl = url ? mediaApi.mediaUrlForDisplay(url) : "";
  const previewSrc = displayUrl || DEFAULT_COMPOSED_SECTION_IMAGE_URL;

  function patchUrlAndAlt(nextUrl: string, nextAlt?: string) {
    if (onPatch) {
      onPatch(nextUrl, nextAlt);
      return;
    }
    ctx?.patchComposedSection?.((section) => {
      let root = updateNodeProp(section.root, nodePath, "url", nextUrl);
      if (nextAlt !== undefined) {
        root = updateNodeProp(root, nodePath, "alt", nextAlt);
      }
      return { ...section, root };
    });
  }

  if (!ctx || !ctx.enabled || !ctx.patchComposedSection) {
    if (previewSrc) {
      return (
        <div className={className}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={alt}
            className={`${imgClassName} cursor-zoom-in`}
            onClick={() => setLightboxOpen(true)}
          />
          <ComposedImageLightbox
            open={lightboxOpen}
            src={previewSrc}
            alt={alt || "Image"}
            onClose={() => setLightboxOpen(false)}
          />
        </div>
      );
    }
    return (
      <div
        className={`flex aspect-[4/5] w-full flex-col items-center justify-center border border-dashed border-[var(--site-primary)]/30 bg-[var(--site-muted-bg)] p-4 text-center text-xs text-muted ${className}`}
      >
        {emptyLabel}
      </div>
    );
  }

  async function onPickFile(file: File | undefined) {
    if (!file || !currentWorkspace) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
      patchUrlAndAlt(
        res.data.url,
        alt.trim() || res.data.originalFilename.replace(/\.[^.]+$/, "")
      );
    } catch (err) {
      setUploadError(err instanceof ApiClientError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`group/inlineimg relative ${className}`} onClick={(e) => e.stopPropagation()}>
      {previewSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={alt || "Image"}
            className={`${imgClassName} cursor-zoom-in`}
            onClick={() => setLightboxOpen(true)}
          />
          <ComposedImageLightbox
            open={lightboxOpen}
            src={previewSrc}
            alt={alt || "Image"}
            onClose={() => setLightboxOpen(false)}
          />
        </>
      ) : (
        <div
          className={`flex aspect-[4/5] w-full flex-col items-center justify-center border-2 border-dashed border-brand/40 bg-[var(--site-muted-bg)] p-4 text-center text-xs text-muted ${imgClassName}`}
        >
          {emptyLabel}
        </div>
      )}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/45 p-2 opacity-0 transition group-hover/inlineimg:opacity-100 group-focus-within/inlineimg:opacity-100">
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
        {displayUrl ? (
          <button
            type="button"
            className="rounded-full border border-red-200/80 bg-red-950/40 px-3 py-1.5 text-[11px] font-semibold text-red-100"
            onClick={() => patchUrlAndAlt("", alt)}
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
        onSelect={(item) => {
          patchUrlAndAlt(item.url, alt || item.originalFilename.replace(/\.[^.]+$/, ""));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

export function ComposedInlineCarouselSlideImage({
  nodePath,
  index,
  className = "",
  imgClassName = "h-full w-full object-cover",
}: {
  nodePath: number[];
  index: number;
  className?: string;
  imgClassName?: string;
}) {
  const ctx = useSectionInlineEdit();
  const composed = ctx ? parseComposedSectionFromData(ctx.data) : null;
  const node = composed ? getNodeAtPath(composed.root, nodePath) : null;
  const slides = Array.isArray(node?.props?.slides)
    ? (node!.props!.slides as { imageUrl?: string; title?: string }[])
    : [];
  const row = slides[index] ?? {};
  const url = row.imageUrl ?? "";

  function patchImage(nextUrl: string) {
    ctx?.patchComposedSection?.((section) => {
      const current = getNodeAtPath(section.root, nodePath);
      const list = Array.isArray(current?.props?.slides)
        ? [...(current!.props!.slides as Record<string, unknown>[])]
        : [];
      while (list.length <= index) list.push({ title: "", body: "" });
      list[index] = { ...list[index], imageUrl: nextUrl };
      return {
        ...section,
        root: updateNodeProp(section.root, nodePath, "slides", list),
      };
    });
  }

  return (
    <ComposedInlineImage
      nodePath={nodePath}
      className={className}
      imgClassName={imgClassName}
      emptyLabel="Card photo"
      readUrl={url}
      readAlt={row.title ?? "Industry"}
      onPatch={(nextUrl) => patchImage(nextUrl)}
    />
  );
}
