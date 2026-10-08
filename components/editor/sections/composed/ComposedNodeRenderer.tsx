"use client";

import { useState } from "react";
import {
  ComposedInlineArrayItemText,
  ComposedInlineGalleryImage,
  ComposedInlineImage,
  ComposedInlineText,
} from "@/components/editor/sections/composed/ComposedInlineField";
import { pathKey } from "@/components/editor/sections/composed/composedTreeEdit";
import { useSectionInlineEdit } from "@/components/editor/inline/SectionInlineEditContext";
import { ComposedIndustryCarousel } from "@/components/editor/sections/composed/ComposedIndustryCarousel";
import type { ComposedNode } from "@/types/composed-section";

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function gridColsClass(columns?: {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}): string {
  const m = columns?.mobile ?? 1;
  const t = columns?.tablet ?? m;
  const d = columns?.desktop ?? t;
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  return [
    map[m] ?? "grid-cols-1",
    t !== m ? `md:${map[t] ?? "grid-cols-2"}` : "",
    d !== t ? `lg:${map[d] ?? "grid-cols-2"}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function gapClass(gap?: string) {
  if (gap === "sm") return "gap-3";
  if (gap === "lg") return "gap-8";
  return "gap-5";
}

function NodeShell({
  nodePath,
  children,
  className = "",
}: {
  nodePath: number[];
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useSectionInlineEdit();
  const canRemove = nodePath.length > 0 && ctx?.enabled && ctx.removeComposedNode;

  return (
    <div className={`relative ${className}`}>
      {canRemove ? (
        <button
          type="button"
          title="Remove this part"
          className="absolute -right-1 -top-1 z-20 rounded-full border border-red-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-red-600 shadow hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            ctx.removeComposedNode?.(nodePath);
          }}
        >
          ×
        </button>
      ) : null}
      {children}
    </div>
  );
}

function renderChildren(node: ComposedNode, nodePath: number[]) {
  return (node.children ?? []).map((child, i) => (
    <ComposedNodeRenderer key={`${pathKey(nodePath)}-${i}`} node={child} nodePath={[...nodePath, i]} />
  ));
}

export function ComposedNodeRenderer({
  node,
  nodePath = [],
}: {
  node: ComposedNode;
  nodePath?: number[];
}) {
  const props = node.props ?? {};
  const children = node.children ?? [];

  switch (node.type) {
    case "container": {
      const max =
        props.maxWidth === "sm"
          ? "max-w-3xl"
          : props.maxWidth === "md"
            ? "max-w-4xl"
            : props.maxWidth === "full"
              ? "max-w-none"
              : "max-w-6xl";
      return (
        <NodeShell nodePath={nodePath}>
          <div className={`mx-auto w-full ${max} ${props.align === "center" ? "text-center" : ""}`}>
            {renderChildren(node, nodePath)}
          </div>
        </NodeShell>
      );
    }
    case "grid":
      return (
        <NodeShell nodePath={nodePath}>
          <div
            className={`grid ${gridColsClass(props.columns as { desktop?: number; tablet?: number; mobile?: number })} ${gapClass(str(props.gap))}`}
          >
            {renderChildren(node, nodePath)}
          </div>
        </NodeShell>
      );
    case "flex": {
      const dir = props.direction === "row" ? "flex-row flex-wrap" : "flex-col";
      const align =
        props.align === "center"
          ? "items-center"
          : props.align === "end"
            ? "items-end"
            : "items-start";
      const justify =
        props.justify === "center"
          ? "justify-center"
          : props.justify === "between"
            ? "justify-between"
            : "justify-start";
      return (
        <NodeShell nodePath={nodePath}>
          <div className={`flex ${dir} ${align} ${justify} ${gapClass(str(props.gap))}`}>
            {renderChildren(node, nodePath)}
          </div>
        </NodeShell>
      );
    }
    case "heading": {
      const level = typeof props.level === "number" ? props.level : 2;
      const Tag = level <= 1 ? "h1" : level === 2 ? "h2" : "h3";
      const size =
        props.size === "xl"
          ? "text-3xl md:text-4xl"
          : props.size === "lg"
            ? "text-2xl md:text-3xl"
            : props.size === "sm"
              ? "text-lg"
              : "text-xl md:text-2xl";
      return (
        <NodeShell nodePath={nodePath}>
          <ComposedInlineText
            nodePath={nodePath}
            prop="text"
            as={Tag}
            placeholder="Heading"
            fallback={str(props.text)}
            className={`font-semibold leading-tight ${size} ${
              props.muted
                ? "text-[var(--site-text)]/45"
                : "text-[var(--site-text)]"
            } ${props.align === "center" ? "text-center" : ""}`}
          />
        </NodeShell>
      );
    }
    case "text":
      return (
        <NodeShell nodePath={nodePath}>
          <ComposedInlineText
            nodePath={nodePath}
            prop="text"
            multiline
            placeholder="Text"
            fallback={str(props.text)}
            className={`leading-relaxed whitespace-pre-wrap ${
              props.size === "lg"
                ? "text-base md:text-lg"
                : props.size === "sm"
                  ? "text-xs"
                  : "text-sm md:text-base"
            } ${props.muted ? "text-[var(--site-text)]/70" : "text-[var(--site-text)]/90"}`}
          />
        </NodeShell>
      );
    case "badge":
      return (
        <NodeShell nodePath={nodePath}>
          <ComposedInlineText
            nodePath={nodePath}
            prop="text"
            placeholder="Label"
            fallback={str(props.text)}
            className="inline-flex rounded-full bg-[var(--site-primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--site-primary)]"
          />
        </NodeShell>
      );
    case "button": {
      const variant =
        props.variant === "ghost" ? "ghost" : props.variant === "secondary" ? "secondary" : "primary";
      const cls =
        variant === "ghost"
          ? "border border-[var(--site-primary)]/30 bg-transparent text-[var(--site-primary)]"
          : variant === "secondary"
            ? "bg-[var(--site-secondary)] text-white"
            : "bg-[var(--site-primary)] text-white";
      return (
        <NodeShell nodePath={nodePath}>
          <span
            className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${cls}`}
          >
            <ComposedInlineText
              nodePath={nodePath}
              prop="label"
              placeholder="Button"
              fallback={str(props.label, "Learn more")}
            />
          </span>
        </NodeShell>
      );
    }
    case "image":
      return (
        <NodeShell nodePath={nodePath}>
          <ComposedInlineImage nodePath={nodePath} emptyLabel="Add photo" />
        </NodeShell>
      );
    case "avatar":
      return (
        <NodeShell nodePath={nodePath}>
          <ComposedInlineImage
            nodePath={nodePath}
            imgClassName="w-full max-w-[12rem] rounded-full object-cover aspect-square"
            emptyLabel="Add avatar"
          />
        </NodeShell>
      );
    case "stats": {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <NodeShell nodePath={nodePath}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item, i) => {
              const row = item as { value?: string; label?: string };
              return (
                <div
                  key={i}
                  className="rounded-lg bg-white/50 p-3 shadow-sm ring-1 ring-black/5"
                >
                  <div className="text-xl font-bold text-[var(--site-primary)]">
                    <ComposedInlineArrayItemText
                      nodePath={nodePath}
                      arrayProp="items"
                      index={i}
                      itemField="value"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-xs text-[var(--site-text)]/70">
                    <ComposedInlineArrayItemText
                      nodePath={nodePath}
                      arrayProp="items"
                      index={i}
                      itemField="label"
                      placeholder="Label"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </NodeShell>
      );
    }
    case "gallery": {
      const images = Array.isArray(props.images) ? props.images : [];
      return (
        <NodeShell nodePath={nodePath}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((_, i) => (
              <ComposedInlineGalleryImage key={i} nodePath={nodePath} index={i} />
            ))}
          </div>
        </NodeShell>
      );
    }
    case "accordion":
    case "tabs": {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <NodeShell nodePath={nodePath}>
          <TabsOrAccordion
            items={items}
            mode={node.type}
            nodePath={nodePath}
            numbered={props.numbered === true}
          />
        </NodeShell>
      );
    }
    case "carousel": {
      const slides = Array.isArray(props.slides) ? props.slides : [];
      if (props.variant === "industry-cards") {
        return (
          <NodeShell nodePath={nodePath}>
            <ComposedIndustryCarousel
              nodePath={nodePath}
              slides={slides}
              showNav={props.showNav === true}
            />
          </NodeShell>
        );
      }
      return (
        <NodeShell nodePath={nodePath}>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {slides.map((slide, i) => {
              const s = slide as { title?: string; body?: string };
              return (
                <div
                  key={i}
                  className="min-w-[85%] snap-center rounded-xl border border-card-border bg-white/80 p-4 md:min-w-[60%]"
                >
                  <p className="font-semibold">
                    <ComposedInlineArrayItemText
                      nodePath={nodePath}
                      arrayProp="slides"
                      index={i}
                      itemField="title"
                      placeholder="Slide title"
                    />
                  </p>
                  <p className="mt-2 text-sm text-[var(--site-text)]/80">
                    <ComposedInlineArrayItemText
                      nodePath={nodePath}
                      arrayProp="slides"
                      index={i}
                      itemField="body"
                      placeholder="Slide text"
                    />
                  </p>
                </div>
              );
            })}
          </div>
        </NodeShell>
      );
    }
    case "card":
      return (
        <NodeShell nodePath={nodePath}>
          <div
            className={`rounded-xl p-4 ${
              props.elevated ? "bg-white shadow-md ring-1 ring-black/5" : "border border-card-border"
            }`}
          >
            {children.map((child, i) => (
              <div key={i} className={i > 0 ? "mt-3" : ""}>
                <ComposedNodeRenderer node={child} nodePath={[...nodePath, i]} />
              </div>
            ))}
          </div>
        </NodeShell>
      );
    case "divider":
      return (
        <NodeShell nodePath={nodePath}>
          <hr
            className={`border-[var(--site-text)]/10 ${props.spacing === "lg" ? "my-8" : props.spacing === "sm" ? "my-3" : "my-5"}`}
          />
        </NodeShell>
      );
    case "spacer":
      return (
        <NodeShell nodePath={nodePath}>
          <div style={{ height: typeof props.size === "number" ? props.size : 24 }} aria-hidden />
        </NodeShell>
      );
    case "socialLinks": {
      const links = Array.isArray(props.links) ? props.links : [];
      return (
        <NodeShell nodePath={nodePath}>
          <div className="flex flex-wrap gap-2">
            {links.map((link, i) => {
              const row = link as { platform?: string; url?: string };
              return (
                <span key={i} className="text-xs font-medium text-[var(--site-primary)]">
                  <ComposedInlineArrayItemText
                    nodePath={nodePath}
                    arrayProp="links"
                    index={i}
                    itemField="platform"
                    placeholder="Link"
                  />
                </span>
              );
            })}
          </div>
        </NodeShell>
      );
    }
    case "form":
      return (
        <NodeShell nodePath={nodePath}>
          <div className="space-y-3 rounded-xl border border-dashed border-[var(--site-primary)]/30 p-4">
            <p className="text-xs font-semibold text-[var(--site-text)]">Contact form</p>
            <div className="h-9 rounded-md bg-[var(--site-muted-bg)]" />
            <div className="h-20 rounded-md bg-[var(--site-muted-bg)]" />
            <ComposedInlineText
              nodePath={nodePath}
              prop="submitLabel"
              placeholder="Send"
              fallback={str(props.submitLabel, "Send")}
              className="inline-flex rounded-lg bg-[var(--site-primary)] px-3 py-2 text-xs font-semibold text-white"
            />
          </div>
        </NodeShell>
      );
    case "input":
      return (
        <NodeShell nodePath={nodePath}>
          <label className="block text-xs">
            <ComposedInlineText
              nodePath={nodePath}
              prop="label"
              placeholder="Field label"
              fallback={str(props.label, "Field")}
              className="font-medium text-[var(--site-text)]"
            />
            <div className="mt-1 h-9 rounded-md border border-card-border bg-white/80 px-2 text-[10px] text-muted">
              {str(props.placeholder, "…")}
            </div>
          </label>
        </NodeShell>
      );
    case "video":
      return (
        <NodeShell nodePath={nodePath}>
          <div className="aspect-video rounded-xl bg-[var(--site-dark)]/90 p-6 text-center text-xs text-white">
            Video placeholder
            <ComposedInlineText
              nodePath={nodePath}
              prop="caption"
              placeholder="Caption"
              className="mt-2 block opacity-80"
            />
          </div>
        </NodeShell>
      );
    case "icon":
      return (
        <NodeShell nodePath={nodePath}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--site-primary)]/15 text-sm font-bold text-[var(--site-primary)]">
            <ComposedInlineText
              nodePath={nodePath}
              prop="name"
              placeholder="★"
              fallback={str(props.name, "★").slice(0, 2).toUpperCase()}
            />
          </span>
        </NodeShell>
      );
    default:
      return null;
  }
}

function TabsOrAccordion({
  items,
  mode,
  nodePath,
  numbered,
}: {
  items: unknown[];
  mode: "tabs" | "accordion";
  nodePath: number[];
  numbered?: boolean;
}) {
  const [active, setActive] = useState(
    mode === "tabs" || numbered ? 0 : -1
  );
  const parsed = items.map((item) => {
    const row = item as { title?: string; body?: string };
    return { title: str(row.title, "Item"), body: str(row.body) };
  });
  if (!parsed.length) return null;

  if (mode === "tabs") {
    return (
      <div>
        <div className="flex flex-wrap gap-2 border-b border-[var(--site-text)]/10 pb-2">
          {parsed.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                active === i
                  ? "bg-[var(--site-primary)] text-white"
                  : "text-[var(--site-text)]/70 hover:bg-black/5"
              }`}
            >
              <ComposedInlineArrayItemText
                nodePath={nodePath}
                arrayProp="items"
                index={i}
                itemField="title"
                placeholder={item.title}
              />
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--site-text)]/85">
          <ComposedInlineArrayItemText
            nodePath={nodePath}
            arrayProp="items"
            index={active}
            itemField="body"
            placeholder="Tab content"
          />
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--site-text)]/10 border-y border-[var(--site-text)]/10">
      {parsed.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-3 py-4 text-left"
            onClick={() => setActive(active === i ? -1 : i)}
          >
            <span className="flex min-w-0 flex-1 items-start gap-3 text-sm font-semibold text-[var(--site-text)]">
              {numbered ? (
                <span className="shrink-0 tabular-nums text-[var(--site-text)]/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : null}
              <ComposedInlineArrayItemText
                nodePath={nodePath}
                arrayProp="items"
                index={i}
                itemField="title"
                placeholder={item.title}
              />
            </span>
            <span className="shrink-0 text-lg leading-none text-[var(--site-text)]/50">
              {active === i ? "−" : "+"}
            </span>
          </button>
          {active === i ? (
            <p
              className={`pb-4 text-sm leading-relaxed text-[var(--site-text)]/75 ${
                numbered ? "pl-9" : ""
              }`}
            >
              <ComposedInlineArrayItemText
                nodePath={nodePath}
                arrayProp="items"
                index={i}
                itemField="body"
                placeholder="Answer"
              />
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
