"use client";

import { useRef, useState } from "react";
import { ImageField } from "@/components/editor/media/ImageField";
import {
  footerQuickLinksFromSections,
  footerServiceLinksFromSections,
  navItemsFromSections,
} from "@/components/editor/sections/sectionNav";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import * as mediaApi from "@/services/media.api";
import type { SectionStyleSettings } from "@/types/editor";
import { AiFieldGenerateButton } from "@/components/editor/ai/AiFieldGenerateButton";
import { useEditorBusinessContext } from "@/components/editor/ai/useEditorBusinessContext";
import { ComposedSectionAdvancedEditor } from "@/components/editor/sections/composed/ComposedSectionAdvancedEditor";
import type { FieldContentType } from "@/lib/fieldContentAi";
import { inferFieldContentTypeFromLabel } from "@/lib/inferFieldContentType";
import type { PageSection } from "@/types/page";

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v : "";
}

function patch(
  section: PageSection,
  key: string,
  value: string,
  updateSectionData: (id: string, data: Record<string, unknown>) => void
) {
  updateSectionData(section.id, { ...section.data, [key]: value });
}

export function SectionContentEditor({
  section,
  variant = "panel",
  onUpdateData,
  onUpdateSettings,
}: {
  section: PageSection;
  variant?: "panel" | "canvas";
  /** When set, edits stay local (caller must save). */
  onUpdateData?: (data: Record<string, unknown>) => void;
  onUpdateSettings?: (settings: SectionStyleSettings) => void;
}) {
  const editor = useEditor();
  const d = section.data;
  const spacious = variant === "canvas";

  const updateData = (id: string, data: Record<string, unknown>) => {
    if (onUpdateData) onUpdateData(data);
    else editor.updateSectionData(id, data);
  };
  const updateSettings = (id: string, settings: SectionStyleSettings) => {
    if (onUpdateSettings) onUpdateSettings(settings);
    else editor.updateSectionSettings(id, settings);
  };

  return (
    <div className={spacious ? "space-y-4" : "space-y-3"}>
      <ContentFields
        section={section}
        d={d}
        updateSectionData={updateData}
        updateSectionSettings={updateSettings}
        spacious={spacious}
      />
    </div>
  );
}

function ContentFields({
  section,
  d,
  updateSectionData,
  updateSectionSettings,
  spacious,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
  updateSectionSettings: (
    id: string,
    settings: import("@/types/editor").SectionStyleSettings
  ) => void;
  spacious?: boolean;
}) {
  switch (section.type) {
    case "HEADER":
      return (
        <HeaderFields
          section={section}
          d={d}
          updateSectionData={updateSectionData}
        />
      );
    case "HERO":
      return (
        <HeroFields
          section={section}
          d={d}
          updateSectionData={updateSectionData}
          updateSectionSettings={updateSectionSettings}
          spacious={spacious}
        />
      );
    case "TEXT":
      return (
        <>
          <Field label="Heading"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <TextArea label="Paragraph"
          required value={str(d, "body")} onChange={(v) => patch(section, "body", v, updateSectionData)} />
        </>
      );
    case "IMAGE":
      return (
        <ImageField
          url={str(d, "url")}
          alt={str(d, "alt")}
          onUrlChange={(url) => updateSectionData(section.id, { ...d, url })}
          onAltChange={(alt) => updateSectionData(section.id, { ...d, alt })}
          onClear={() => updateSectionData(section.id, { ...d, url: "", alt: "" })}
        />
      );
    case "SERVICES":
    case "FEATURES":
      return (
        <ListVariantFields
          section={section}
          d={d}
          updateSectionData={updateSectionData}
          spacious={spacious}
        />
      );
    case "GALLERY":
      return (
        <>
          <Field label="Section title"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <GalleryEditor section={section} updateSectionData={updateSectionData} spacious={spacious} />
        </>
      );
    case "TESTIMONIALS":
      return (
        <>
          <Field label="Section title"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <TextArea label="Customer quote" value={str(d, "quote")} onChange={(v) => patch(section, "quote", v, updateSectionData)} />
          <Field label="Customer name" value={str(d, "author")} onChange={(v) => patch(section, "author", v, updateSectionData)} />
        </>
      );
    case "PRICING":
      return (
        <>
          <Field label="Section title"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <Field label="Plan name" value={str(d, "planName")} onChange={(v) => patch(section, "planName", v, updateSectionData)} />
          <Field label="Price" value={str(d, "price")} onChange={(v) => patch(section, "price", v, updateSectionData)} />
          <TextArea
            label="Included items (one per line)"
            value={itemsToLines(d.features)}
            onChange={(v) =>
              updateSectionData(section.id, {
                ...d,
                features: v.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </>
      );
    case "FAQ":
      return (
        <>
          <Field label="Section title"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <TextArea
            label="Questions (one per line: question — answer)"
            value={faqToLines(d.items)}
            onChange={(v) =>
              updateSectionData(section.id, {
                ...d,
                items: v
                  .split("\n")
                  .map(parseFaqLine)
                  .filter((row) => row.q || row.a),
              })
            }
          />
        </>
      );
    case "CONTACT":
      return (
        <>
          <Field label="Section title"
          required value={str(d, "heading")} onChange={(v) => patch(section, "heading", v, updateSectionData)} />
          <Field label="Intro text" value={str(d, "body")} onChange={(v) => patch(section, "body", v, updateSectionData)} />
          <Field label="Display email (optional)" value={str(d, "email")} onChange={(v) => patch(section, "email", v, updateSectionData)} hint="Shown beside the form; inquiries are emailed to your Safnom account." />
          <Field label="Submit button label" value={str(d, "submitLabel") || str(d, "buttonText")} onChange={(v) => patch(section, "submitLabel", v, updateSectionData)} />
          <Field label="Success message" value={str(d, "successMessage")} onChange={(v) => patch(section, "successMessage", v, updateSectionData)} />
        </>
      );
    case "FOOTER":
      return (
        <FooterFields
          section={section}
          d={d}
          updateSectionData={updateSectionData}
        />
      );
    case "COMPOSED":
      return (
        <ComposedSectionAdvancedEditor
          section={section}
          onUpdateData={(data) => updateSectionData(section.id, data)}
        />
      );
    default:
      return null;
  }
}

function parseFaqLine(line: string): { q: string; a: string } {
  const trimmed = line.trim();
  if (!trimmed) return { q: "", a: "" };
  const dash = trimmed.match(/^(.+?)\s*[—–-]\s*(.+)$/);
  if (dash) return { q: dash[1].trim(), a: dash[2].trim() };
  const pipe = trimmed.split("|");
  if (pipe.length >= 2) {
    return { q: (pipe[0] ?? "").trim(), a: pipe.slice(1).join("|").trim() };
  }
  return { q: trimmed, a: "" };
}

function HeroFields({
  section,
  d,
  updateSectionData,
  updateSectionSettings,
  spacious,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
  updateSectionSettings: (id: string, settings: SectionStyleSettings) => void;
  spacious?: boolean;
}) {
  const settings = (section.settings ?? {}) as SectionStyleSettings;
  const setSettings = (next: SectionStyleSettings) =>
    updateSectionSettings(section.id, next);

  return (
    <div className={spacious ? "space-y-4" : "space-y-3"}>
      <RequiredHint />
      <Field label="Brand wordmark" value={str(d, "brandWordmark")} onChange={(v) => patch(section, "brandWordmark", v, updateSectionData)} />
      <Field label="Eyebrow" value={str(d, "eyebrow")} onChange={(v) => patch(section, "eyebrow", v, updateSectionData)} />
      <Field label="Headline"
        required value={str(d, "title")} onChange={(v) => patch(section, "title", v, updateSectionData)} />
      <TextArea label="Short description" value={str(d, "description")} onChange={(v) => patch(section, "description", v, updateSectionData)} />
      <Field label="Collection label" value={str(d, "collectionLabel")} onChange={(v) => patch(section, "collectionLabel", v, updateSectionData)} />
      <div>
        <FieldLabel>Banner image <span className="font-semibold text-red-600">*</span></FieldLabel>
        <ImageField
        url={str(d, "imageUrl")}
        alt={str(d, "imageAlt")}
        onUrlChange={(imageUrl) => updateSectionData(section.id, { ...d, imageUrl })}
        onAltChange={(imageAlt) => updateSectionData(section.id, { ...d, imageAlt })}
        onClear={() => updateSectionData(section.id, { ...d, imageUrl: "", imageAlt: "" })}
      />
      </div>
      <Field label="Primary button label"
        required value={str(d, "buttonText")} onChange={(v) => patch(section, "buttonText", v, updateSectionData)} />
      <Field label="Primary button link" value={str(d, "buttonUrl")} onChange={(v) => patch(section, "buttonUrl", v, updateSectionData)} hint="e.g. #contact or https://…" />
      <Field label="Secondary button label" value={str(d, "secondaryButtonText")} onChange={(v) => patch(section, "secondaryButtonText", v, updateSectionData)} />
      <Field label="Secondary button link" value={str(d, "secondaryButtonUrl")} onChange={(v) => patch(section, "secondaryButtonUrl", v, updateSectionData)} />
      <div className="border-t border-black/10 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase text-muted">Layout & style</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Layout</FieldLabel>
            <select
              className="input-field w-full rounded-lg text-sm"
              value={settings.layout ?? "split"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  layout: e.target.value as SectionStyleSettings["layout"],
                })
              }
            >
              <option value="split">Two columns (image + text)</option>
              <option value="center">Centered stack</option>
            </select>
          </div>
          <div>
            <FieldLabel>Image position</FieldLabel>
            <select
              className="input-field w-full rounded-lg text-sm"
              value={settings.imagePosition ?? "right"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  imagePosition: e.target.value as SectionStyleSettings["imagePosition"],
                })
              }
              disabled={(settings.layout ?? "split") === "center"}
            >
              <option value="right">Image right</option>
              <option value="left">Image left</option>
            </select>
          </div>
          <div>
            <FieldLabel>Text alignment</FieldLabel>
            <select
              className="input-field w-full rounded-lg text-sm"
              value={settings.alignment ?? "left"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alignment: e.target.value as SectionStyleSettings["alignment"],
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <FieldLabel>Image corners</FieldLabel>
            <select
              className="input-field w-full rounded-lg text-sm"
              value={settings.imageRadius ?? "lg"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  imageRadius: e.target.value as SectionStyleSettings["imageRadius"],
                })
              }
            >
              <option value="lg">Rounded (24px)</option>
              <option value="md">Rounded (16px)</option>
              <option value="none">Square</option>
            </select>
          </div>
          <div>
            <FieldLabel>Vertical spacing</FieldLabel>
            <select
              className="input-field w-full rounded-lg text-sm"
              value={settings.paddingY ?? "lg"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  paddingY: e.target.value as SectionStyleSettings["paddingY"],
                })
              }
            >
              <option value="sm">Compact</option>
              <option value="md">Medium</option>
              <option value="lg">Generous</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function itemsToLines(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items.map((x) => String(x)).join("\n");
}

function faqToLines(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((row) => {
      if (row && typeof row === "object" && "q" in row && "a" in row) {
        return `${String((row as { q: unknown }).q)} — ${String((row as { a: unknown }).a)}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function Field({
  label,
  value,
  onChange,
  hint,
  required,
  aiFieldType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
  aiFieldType?: FieldContentType;
}) {
  const businessContext = useEditorBusinessContext();
  const fieldType = aiFieldType ?? inferFieldContentTypeFromLabel(label, false);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>
          {label}
          {required ? (
            <span className="ml-1 font-semibold text-red-600">*</span>
          ) : null}
        </FieldLabel>
        <AiFieldGenerateButton
          variant="panel"
          fieldType={fieldType}
          fieldLabel={label}
          currentValue={value}
          businessContext={businessContext}
          onApply={onChange}
        />
      </div>
      <Input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-1 text-[10px] text-muted">{hint}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
  hint,
  aiFieldType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  aiFieldType?: FieldContentType;
}) {
  const businessContext = useEditorBusinessContext();
  const fieldType = aiFieldType ?? inferFieldContentTypeFromLabel(label, true);

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>
          {label}
          {required ? (
            <span className="ml-1 font-semibold text-red-600">*</span>
          ) : null}
        </FieldLabel>
        <AiFieldGenerateButton
          variant="panel"
          fieldType={fieldType}
          fieldLabel={label}
          currentValue={value}
          businessContext={businessContext}
          onApply={onChange}
        />
      </div>
      <textarea
        className="input-field min-h-[80px] w-full rounded-lg text-sm"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-1 text-[10px] text-muted">{hint}</p> : null}
    </div>
  );
}

function RequiredHint() {
  return (
    <p className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-[11px] text-muted">
      Fields marked <span className="font-semibold text-red-600">*</span> are
      required so the section looks complete.
    </p>
  );
}

function sectionVariant(section: PageSection): string {
  return String(
    (section.settings as { variant?: string } | undefined)?.variant ?? "default"
  );
}

function FooterAutoLinksList({
  title,
  emptyMessage,
  items,
}: {
  title: string;
  emptyMessage: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <FieldLabel>{title}</FieldLabel>
      <p className="mb-2 text-[11px] text-muted">
        Built automatically from sections on this page.
      </p>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-card-border px-3 py-2 text-xs text-muted">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-1.5 rounded-md border border-card-border bg-slate-50/80 px-3 py-2">
          {items.map((item) => (
            <li
              key={`${item.href}-${item.label}`}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="font-medium">{item.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-muted">
                {item.href}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeaderFields({
  section,
  d,
  updateSectionData,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
}) {
  const logistics = sectionVariant(section) === "logistics";
  const { sections } = useEditor();
  const pageNav = logistics ? navItemsFromSections(sections) : [];

  return (
    <>
      <RequiredHint />
      <Field
        label="Business / logo name"
        required
        value={str(d, "logoText")}
        onChange={(v) => patch(section, "logoText", v, updateSectionData)}
      />
      {logistics ? (
        <>
          <Field
            label="Logo subtitle"
            value={str(d, "logoSub")}
            onChange={(v) => patch(section, "logoSub", v, updateSectionData)}
          />
          <Field
            label="Phone"
            required
            value={str(d, "phone")}
            onChange={(v) => patch(section, "phone", v, updateSectionData)}
          />
          <Field
            label="Track label"
            value={str(d, "trackLabel")}
            onChange={(v) => patch(section, "trackLabel", v, updateSectionData)}
          />
          <Field
            label="Track link"
            value={str(d, "trackUrl")}
            onChange={(v) => patch(section, "trackUrl", v, updateSectionData)}
            hint="e.g. #track — only shown when that section exists"
          />
          <div>
            <FieldLabel>Menu links</FieldLabel>
            <p className="mb-2 text-[11px] text-muted">
              Built automatically from sections on this page. Add or remove
              blocks to change the menu.
            </p>
            {pageNav.length === 0 ? (
              <p className="rounded-md border border-dashed border-card-border px-3 py-2 text-xs text-muted">
                No page sections yet — menu will appear once you add content
                blocks.
              </p>
            ) : (
              <ul className="space-y-1.5 rounded-md border border-card-border bg-slate-50/80 px-3 py-2">
                {pageNav.map((item) => (
                  <li
                    key={`${item.href}-${item.label}`}
                    className="flex items-baseline justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold uppercase tracking-wide">
                      {item.label}
                      {item.sub ? (
                        <span className="ml-2 font-normal normal-case tracking-normal text-muted">
                          {item.sub}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted">
                      {item.href}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <Field
            label="Menu label"
            value={str(d, "navLabel")}
            onChange={(v) => patch(section, "navLabel", v, updateSectionData)}
          />
          <Field
            label="Announcement bar"
            value={str(d, "announcement")}
            onChange={(v) => patch(section, "announcement", v, updateSectionData)}
          />
          <Field
            label="Announcement links"
            value={str(d, "announcementLinks")}
            onChange={(v) =>
              patch(section, "announcementLinks", v, updateSectionData)
            }
          />
          <TextArea
            label="Nav items (one per line)"
            value={itemsToLines(
              Array.isArray(d.navItems) ? d.navItems : undefined
            )}
            onChange={(v) =>
              updateSectionData(section.id, {
                ...d,
                navItems: v
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            hint="Add one menu item per line."
          />
        </>
      )}
    </>
  );
}

function FooterFields({
  section,
  d,
  updateSectionData,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
}) {
  const logistics = sectionVariant(section) === "logistics";
  const { sections } = useEditor();
  const serviceNav = logistics ? footerServiceLinksFromSections(sections) : [];
  const quickNav = logistics ? footerQuickLinksFromSections(sections) : [];

  if (!logistics) {
    return (
      <>
        <RequiredHint />
        <Field
          label="Copyright line"
          required
          value={str(d, "copyright")}
          onChange={(v) => patch(section, "copyright", v, updateSectionData)}
        />
        <Field
          label="Extra links text"
          value={str(d, "links")}
          onChange={(v) => patch(section, "links", v, updateSectionData)}
        />
      </>
    );
  }
  return (
    <>
      <RequiredHint />
      <Field
        label="Logo / brand name"
        required
        value={str(d, "logoText")}
        onChange={(v) => patch(section, "logoText", v, updateSectionData)}
      />
      <TextArea
        label="About blurb"
        required
        value={str(d, "about")}
        onChange={(v) => patch(section, "about", v, updateSectionData)}
      />
      <Field
        label="Social links text"
        value={str(d, "social")}
        onChange={(v) => patch(section, "social", v, updateSectionData)}
      />
      <Field
        label="Services column heading"
        value={str(d, "servicesHeading")}
        onChange={(v) =>
          patch(section, "servicesHeading", v, updateSectionData)
        }
      />
      <FooterAutoLinksList
        title="Service links"
        emptyMessage="Add a Services block with list items to populate this column."
        items={serviceNav}
      />
      <Field
        label="Quicklinks heading"
        value={str(d, "quickHeading")}
        onChange={(v) => patch(section, "quickHeading", v, updateSectionData)}
      />
      <FooterAutoLinksList
        title="Quick links"
        emptyMessage="Links appear from page sections (and track / quote when available)."
        items={quickNav}
      />
      <Field
        label="Subscribe heading"
        value={str(d, "subscribeHeading")}
        onChange={(v) =>
          patch(section, "subscribeHeading", v, updateSectionData)
        }
      />
      <TextArea
        label="Subscribe text"
        value={str(d, "subscribeBody")}
        onChange={(v) => patch(section, "subscribeBody", v, updateSectionData)}
      />
      <Field
        label="Email placeholder"
        value={str(d, "subscribePlaceholder")}
        onChange={(v) =>
          patch(section, "subscribePlaceholder", v, updateSectionData)
        }
      />
      <Field
        label="Subscribe button"
        value={str(d, "subscribeButton")}
        onChange={(v) =>
          patch(section, "subscribeButton", v, updateSectionData)
        }
      />
      <Field
        label="Copyright line"
          required
        value={str(d, "copyright")}
        onChange={(v) => patch(section, "copyright", v, updateSectionData)}
      />
    </>
  );
}

function ListVariantFields({
  section,
  d,
  updateSectionData,
  spacious,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
  spacious?: boolean;
}) {
  const variant = sectionVariant(section);

  if (variant === "innovation") {
    return (
      <InnovationFields
        section={section}
        d={d}
        updateSectionData={updateSectionData}
        spacious={spacious}
      />
    );
  }

  if (variant === "whyChoose") {
    return (
      <>
        <RequiredHint />
        <Field
          label="Section title"
          required
          value={str(d, "heading")}
          onChange={(v) => patch(section, "heading", v, updateSectionData)}
        />
        <TextArea
          label="Pillars (one per line)"
          required
          value={itemsToLines(d.pillars)}
          onChange={(v) =>
            updateSectionData(section.id, {
              ...d,
              pillars: v
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          hint="Add at least one pillar per line."
        />
        <TextArea
          label="Body text"
          required
          value={str(d, "body")}
          onChange={(v) => patch(section, "body", v, updateSectionData)}
        />
        <div>
          <FieldLabel>
            Main photo <span className="font-semibold text-red-600">*</span>
          </FieldLabel>
          <ImageField
            url={str(d, "imageUrl")}
            alt={str(d, "imageAlt")}
            onUrlChange={(imageUrl) =>
              updateSectionData(section.id, { ...d, imageUrl })
            }
            onAltChange={(imageAlt) =>
              updateSectionData(section.id, { ...d, imageAlt })
            }
            onClear={() =>
              updateSectionData(section.id, {
                ...d,
                imageUrl: "",
                imageAlt: "",
              })
            }
          />
        </div>
        <div>
          <FieldLabel>Stack photo 2</FieldLabel>
          <ImageField
            url={str(d, "imageUrl2")}
            alt=""
            onUrlChange={(imageUrl2) =>
              updateSectionData(section.id, { ...d, imageUrl2 })
            }
            onAltChange={() => undefined}
            onClear={() =>
              updateSectionData(section.id, { ...d, imageUrl2: "" })
            }
          />
        </div>
        <div>
          <FieldLabel>Stack photo 3</FieldLabel>
          <ImageField
            url={str(d, "imageUrl3")}
            alt=""
            onUrlChange={(imageUrl3) =>
              updateSectionData(section.id, { ...d, imageUrl3 })
            }
            onAltChange={() => undefined}
            onClear={() =>
              updateSectionData(section.id, { ...d, imageUrl3: "" })
            }
          />
        </div>
      </>
    );
  }

  if (variant === "serviceCards" || variant === "darkServiceGrid") {
    return (
      <>
        <RequiredHint />
        <Field
          label="Section title"
          required={variant === "darkServiceGrid"}
          value={str(d, "heading")}
          onChange={(v) => patch(section, "heading", v, updateSectionData)}
        />
        <Field
          label="Highlighted card title"
          required
          value={str(d, "activeTitle")}
          onChange={(v) => patch(section, "activeTitle", v, updateSectionData)}
          hint="Must match an item title exactly (e.g. Wood-Fired Mains)"
        />
        <TextArea
          label="Services (one per line: Title|Description)"
          required
          value={itemsToLines(d.items)}
          onChange={(v) =>
            updateSectionData(section.id, {
              ...d,
              items: v
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          hint="Keep at least one item: Title|Description"
        />
      </>
    );
  }

  return (
    <>
      <RequiredHint />
      <Field
        label="Section title"
          required
        value={str(d, "heading")}
        onChange={(v) => patch(section, "heading", v, updateSectionData)}
      />
      <TextArea
        label="Bullet points (one per line)"
        required
        value={itemsToLines(d.items)}
        onChange={(v) =>
          updateSectionData(section.id, {
            ...d,
            items: v
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
      />
    </>
  );
}

function InnovationFields({
  section,
  d,
  updateSectionData,
  spacious,
}: {
  section: PageSection;
  d: Record<string, unknown>;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
  spacious?: boolean;
}) {
  const cards = Array.isArray(d.cards)
    ? (d.cards as { title?: string; body?: string; imageUrl?: string }[])
    : [];

  function setCards(
    next: { title?: string; body?: string; imageUrl?: string }[]
  ) {
    updateSectionData(section.id, { ...d, cards: next });
  }

  function updateCard(
    index: number,
    patchCard: Partial<{ title: string; body: string; imageUrl: string }>
  ) {
    const next = cards.map((c, i) =>
      i === index ? { ...c, ...patchCard } : c
    );
    setCards(next);
  }

  return (
    <>
      <RequiredHint />
      <Field
        label="Section title"
          required
        value={str(d, "heading")}
        onChange={(v) => patch(section, "heading", v, updateSectionData)}
      />
      <TextArea
        label="Supporting paragraph"
        required
        value={str(d, "body")}
        onChange={(v) => patch(section, "body", v, updateSectionData)}
      />
      <Field
        label="Signature name"
        required
        value={str(d, "signature")}
        onChange={(v) => patch(section, "signature", v, updateSectionData)}
      />
      <Field
        label="Signature role"
        value={str(d, "signatureRole")}
        onChange={(v) => patch(section, "signatureRole", v, updateSectionData)}
      />

      <div className="space-y-3 border-t border-black/10 pt-3">
        <p className="text-xs font-semibold uppercase text-muted">
          Feature cards
        </p>
        {cards.length === 0 ? (
          <p className="text-xs text-muted">
            Add at least one card with title, description, and image.
          </p>
        ) : null}
        {cards.map((card, i) => (
          <div
            key={i}
            className={`space-y-3 rounded-lg border border-card-border ${
              spacious ? "p-4" : "p-3"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted">Card {i + 1}</p>
              <button
                type="button"
                className="text-[11px] font-medium text-red-600"
                onClick={() => setCards(cards.filter((_, j) => j !== i))}
              >
                Remove card
              </button>
            </div>
            <Field
              label="Card title"
              required
              value={card.title ?? ""}
              onChange={(v) => updateCard(i, { title: v })}
            />
            <TextArea
              label="Card description"
              required
              value={card.body ?? ""}
              onChange={(v) => updateCard(i, { body: v })}
            />
            <div>
              <FieldLabel>
                Card image <span className="font-semibold text-red-600">*</span>
              </FieldLabel>
              <ImageField
                url={card.imageUrl ?? ""}
                alt={card.title ?? ""}
                onUrlChange={(imageUrl) => updateCard(i, { imageUrl })}
                onAltChange={() => undefined}
                onClear={() => updateCard(i, { imageUrl: "" })}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-medium text-brand"
          onClick={() =>
            setCards([...cards, { title: "", body: "", imageUrl: "" }])
          }
        >
          + Add card
        </button>
      </div>
    </>
  );
}

function GalleryEditor({
  section,
  updateSectionData,
  spacious,
}: {
  section: PageSection;
  updateSectionData: (id: string, data: Record<string, unknown>) => void;
  spacious?: boolean;
}) {
  const multiRef = useRef<HTMLInputElement>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const images = Array.isArray(section.data.images)
    ? (section.data.images as { url?: string; alt?: string }[])
    : [];

  async function onUploadMany(files: FileList | null) {
    if (!files?.length || !currentWorkspace) return;
    setBatchError(null);
    setBatchLoading(true);
    const next = [...images];
    try {
      for (const file of Array.from(files)) {
        const res = await mediaApi.uploadMedia(currentWorkspace.id, file);
        next.push({
          url: res.data.url,
          alt: res.data.originalFilename.replace(/\.[^.]+$/, ""),
        });
      }
      updateSectionData(section.id, { ...section.data, images: next });
    } catch (err) {
      setBatchError(
        err instanceof ApiClientError ? err.message : "Upload failed"
      );
    } finally {
      setBatchLoading(false);
    }
  }

  function updateRow(index: number, url: string, alt: string) {
    const next = [...images];
    next[index] = { url, alt };
    updateSectionData(section.id, { ...section.data, images: next });
  }

  function addRow() {
    updateSectionData(section.id, {
      ...section.data,
      images: [...images, { url: "", alt: "" }],
    });
  }

  function removeRow(index: number) {
    updateSectionData(section.id, {
      ...section.data,
      images: images.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
        <p className="text-sm font-medium">Gallery photos</p>
        <p className="mt-1 text-xs text-muted">
          Upload one or many images (max 2 MB each).
        </p>
        <input
          ref={multiRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void onUploadMany(e.target.files)}
        />
        <button
          type="button"
          disabled={batchLoading}
          className="btn-primary mt-3 w-full rounded-lg py-2 text-xs sm:w-auto sm:px-5"
          onClick={() => multiRef.current?.click()}
        >
          {batchLoading ? "Uploading…" : "Upload photos"}
        </button>
        {batchError ? (
          <p className="mt-2 text-xs text-red-600">{batchError}</p>
        ) : null}
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-muted">No photos yet — use Upload photos above.</p>
      ) : null}

      {images.map((img, i) => (
        <div
          key={i}
          className={`rounded-lg border border-card-border ${spacious ? "p-4" : "p-2"}`}
        >
          <p className="mb-2 text-xs font-medium text-muted">Photo {i + 1}</p>
          <ImageField
            url={img.url ?? ""}
            alt={img.alt ?? ""}
            onUrlChange={(url) => updateRow(i, url, img.alt ?? "")}
            onAltChange={(alt) => updateRow(i, img.url ?? "", alt)}
            onClear={() => removeRow(i)}
          />
        </div>
      ))}
      <button type="button" className="text-xs font-medium text-brand" onClick={addRow}>
        + Add empty slot (link or upload)
      </button>
    </div>
  );
}
