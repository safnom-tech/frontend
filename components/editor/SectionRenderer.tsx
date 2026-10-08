"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SECTION_DISPLAY } from "@/components/editor/editorUiConstants";
import {
  EditBannerImageDialog,
  sectionBannerImageKeys,
} from "@/components/editor/EditBannerImageDialog";
import { EditSectionWithAi } from "@/components/editor/ai/EditSectionWithAi";
import { SectionToolbarButtonLink } from "@/components/editor/SectionToolbarButtonLink";
import { SectionToolbarSectionColors } from "@/components/editor/SectionToolbarSectionColors";
import {
  firstMissingInlineFieldKey,
  focusInlineSectionField,
} from "@/lib/sectionValidationFocus";
import { SectionContentEditor } from "@/components/editor/SectionContentEditor";
import { missingRequiredSectionFields } from "@/components/editor/sectionValidation";
import {
  normalizeWebsiteTheme,
  resolveSectionStyle,
  themeCssVars,
} from "@/components/editor/sections/sectionStyles";
import { SectionInlineEditProvider } from "@/components/editor/inline/SectionInlineEditContext";
import { sectionViewRegistry } from "@/components/editor/sections/registry";
import { useEditor } from "@/contexts/EditorContext";
import { confirmAction } from "@/lib/confirm";
import { notify } from "@/lib/notify";
import type { EditorThemeDraft, SectionStyleSettings } from "@/types/editor";
import type { PageSection } from "@/types/page";

function cloneSection(section: PageSection): PageSection {
  return {
    ...section,
    data: { ...section.data },
    settings: { ...(section.settings ?? {}) },
  };
}

export function SectionRenderer({
  section,
  selected,
  editing,
  onStartEdit,
  theme,
  previewMode,
  layoutClassName,
}: {
  section: PageSection;
  selected: boolean;
  editing: boolean;
  onStartEdit: () => void;
  theme: EditorThemeDraft;
  previewMode: boolean;
  layoutClassName?: string;
}) {
  const {
    removeSection,
    duplicateSection,
    updateSectionData,
    updateSectionSettings,
    flushAutosave,
    selectSection,
    stopEditingSection,
    sections,
  } = useEditor();
  const rootRef = useRef<HTMLDivElement>(null);
  const View = sectionViewRegistry[section.type];
  const normalizedTheme = normalizeWebsiteTheme(theme);
  const themeVars = themeCssVars(normalizedTheme);
  const themeTextFallback = normalizedTheme.colors?.text ?? "#1a3a4a";
  const inlineEditing = editing && !previewMode;
  const label = SECTION_DISPLAY[section.type].label;

  const [draft, setDraft] = useState(() => cloneSection(section));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBannerImage, setShowBannerImage] = useState(false);
  const bannerKeys = sectionBannerImageKeys(draft);

  useEffect(() => {
    if (inlineEditing) {
      setDraft(cloneSection(section));
      setValidationError(null);
      setShowAdvanced(false);
      setShowBannerImage(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed only when edit session starts
  }, [inlineEditing, section.id]);

  const draftDirty = useMemo(() => {
    return (
      JSON.stringify(draft.data) !== JSON.stringify(section.data) ||
      JSON.stringify(draft.settings ?? {}) !==
        JSON.stringify(section.settings ?? {})
    );
  }, [draft, section]);

  const pageSections = useMemo(
    () =>
      sections.map((s) => (s.id === section.id && inlineEditing ? draft : s)),
    [sections, section.id, inlineEditing, draft]
  );

  const style = resolveSectionStyle(inlineEditing ? draft : section);

  useEffect(() => {
    if (selected && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected]);

  useEffect(() => {
    if (!inlineEditing || !draftDirty) return;
    updateSectionData(section.id, draft.data);
    updateSectionSettings(
      section.id,
      (draft.settings ?? {}) as SectionStyleSettings
    );
  }, [
    inlineEditing,
    draftDirty,
    draft,
    section.id,
    updateSectionData,
    updateSectionSettings,
  ]);

  async function finishEditing() {
    const missing = missingRequiredSectionFields(draft);
    if (missing.length > 0) {
      const msg = `Fill required fields: ${missing.join(", ")}`;
      setValidationError(msg);
      notify.warning(msg);
      const fieldKey = firstMissingInlineFieldKey(draft);
      if (fieldKey) {
        window.setTimeout(() => focusInlineSectionField(fieldKey), 100);
      }
      return;
    }
    setValidationError(null);
    await flushAutosave();
    stopEditingSection();
    selectSection(null);
  }

  if (!View) {
    return (
      <div className="p-4 text-sm text-red-600">
        Unknown section: {section.type}
      </div>
    );
  }

  if (inlineEditing) {
    return (
      <div
        ref={rootRef}
        className={`relative border-y-2 border-[var(--editor-primary)] bg-white shadow-sm ${layoutClassName ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--editor-primary)]/20 bg-[var(--editor-primary)]/10 px-4 py-2">
          <span className="text-xs font-semibold text-[var(--editor-secondary,var(--editor-text))]">
            Editing · {label}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-[10px] text-muted sm:inline">
              {section.type === "COMPOSED"
                ? "Click text/images · changes save automatically"
                : "Click text or images · changes save automatically"}
            </span>
            {bannerKeys ? (
              <button
                type="button"
                className="rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold text-brand hover:bg-brand/15"
                onClick={() => setShowBannerImage(true)}
              >
                Banner image
              </button>
            ) : null}
            <SectionToolbarSectionColors
              theme={theme}
              settings={(draft.settings ?? {}) as SectionStyleSettings}
              onChange={(patch) =>
                setDraft((prev) => ({
                  ...prev,
                  settings: { ...(prev.settings ?? {}), ...patch },
                }))
              }
            />
            {draft.type === "HERO" ? (
              <SectionToolbarButtonLink
                pageSections={pageSections}
                buttonUrl={String(draft.data.buttonUrl ?? "")}
                onChange={(buttonUrl) =>
                  setDraft((prev) => ({
                    ...prev,
                    data: { ...prev.data, buttonUrl },
                  }))
                }
              />
            ) : null}
            <EditSectionWithAi
              section={draft}
              variant="toolbar"
              onApply={({ data, settings }) => {
                setDraft((prev) => ({
                  ...prev,
                  ...(data ? { data } : {}),
                  ...(settings
                    ? { settings: settings as Record<string, unknown> }
                    : {}),
                }));
                setValidationError(null);
              }}
            />
            <button
              type="button"
              className="rounded-md border border-card-border bg-white px-2.5 py-1 text-[10px] font-semibold hover:bg-black/[0.03]"
              onClick={() => setShowAdvanced(true)}
            >
              Advanced
            </button>
            <button
              type="button"
              className="rounded-md border border-card-border bg-white px-2.5 py-1 text-[10px] font-semibold hover:bg-black/[0.03]"
              onClick={() => void duplicateSection(section.id)}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-neutral-800"
              onClick={() => void finishEditing()}
            >
              Done
            </button>
            <button
              type="button"
              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
              onClick={() => {
                void (async () => {
                  if (
                    !(await confirmAction({
                      title: "Remove block?",
                      message: "This block will be removed from the page.",
                      confirmLabel: "Remove",
                      tone: "danger",
                    }))
                  ) {
                    return;
                  }
                  void removeSection(section.id);
                })();
              }}
            >
              Delete block
            </button>
          </div>
        </div>
        {validationError ? (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {validationError}
          </div>
        ) : null}
        <div className="min-w-0" style={themeVars}>
          <SectionInlineEditProvider
            active
            showCanvasChrome
            data={draft.data}
            settings={(draft.settings ?? {}) as SectionStyleSettings}
            themeTextFallback={themeTextFallback}
            onSettingsPatch={(patch) =>
              setDraft((prev) => ({
                ...prev,
                settings: { ...(prev.settings ?? {}), ...patch },
              }))
            }
            onChange={(data) => {
              setDraft((prev) => ({ ...prev, data }));
              setValidationError(null);
            }}
          >
            <View
              section={draft}
              style={style}
              themeVars={themeVars}
              pageSections={pageSections}
            />
          </SectionInlineEditProvider>
        </div>
        {showBannerImage && bannerKeys ? (
          <EditBannerImageDialog
            section={draft}
            onClose={() => setShowBannerImage(false)}
            onUpdateData={(data) => {
              setDraft((prev) => ({ ...prev, data }));
              setValidationError(null);
            }}
          />
        ) : null}
        {showAdvanced ? (
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="dialog"
            aria-modal
            aria-label="Advanced block settings"
            onClick={() => setShowAdvanced(false)}
          >
            <div
              className="max-h-[min(85vh,640px)] w-full max-w-lg overflow-y-auto rounded-xl border border-card-border bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-card-border bg-white px-4 py-3">
                <p className="text-sm font-semibold">Advanced · {label}</p>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-muted hover:bg-black/[0.04]"
                  onClick={() => setShowAdvanced(false)}
                >
                  Close
                </button>
              </div>
              <div className="p-4">
                <SectionContentEditor
                  section={draft}
                  variant="canvas"
                  onUpdateData={(data) => {
                    setDraft((prev) => ({ ...prev, data }));
                    setValidationError(null);
                  }}
                  onUpdateSettings={(settings) =>
                    setDraft((prev) => ({
                      ...prev,
                      settings: settings as Record<string, unknown>,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`group relative outline-none transition ${layoutClassName ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-10 ring-inset transition ${
          selected
            ? "ring-2 ring-brand"
            : "ring-0 group-hover:ring-2 group-hover:ring-brand/40"
        }`}
      />
      <div
        className={`pointer-events-none absolute left-3 top-3 z-[60] rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-md transition ${
          selected
            ? "bg-brand text-white opacity-100"
            : "bg-neutral-900/85 text-white opacity-0 group-hover:opacity-100"
        }`}
      >
        Click to edit
      </div>
      <div className="absolute right-3 top-3 z-[60] sm:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className="inline-flex cursor-pointer items-center rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-lg ring-2 ring-white/90"
        >
          Click to edit
        </button>
      </div>
      <div className="absolute left-1/2 top-3 z-[60] hidden -translate-x-1/2 opacity-0 transition group-hover:opacity-100 sm:block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className="inline-flex cursor-pointer items-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-xl ring-4 ring-white/95 hover:bg-brand-deep"
        >
          Click to edit
        </button>
      </div>
      <div className="pointer-events-auto">
        <SectionInlineEditProvider
          active={false}
          showCanvasChrome
          data={section.data}
          settings={(section.settings ?? {}) as SectionStyleSettings}
          themeTextFallback={themeTextFallback}
          onChange={() => {}}
        >
          <View
            section={section}
            style={style}
            themeVars={themeVars}
            pageSections={pageSections}
          />
        </SectionInlineEditProvider>
      </div>
    </div>
  );
}
