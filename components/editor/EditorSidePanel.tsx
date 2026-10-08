"use client";

import { useState } from "react";
import {
  MORE_ADD_TYPES,
  QUICK_ADD_TYPES,
  SECTION_DISPLAY,
  SECTION_FORMAT_PRESETS,
  isPinnedSectionType,
  sectionListTitle,
} from "@/components/editor/editorUiConstants";
import { AiComposedSectionEdit } from "@/components/editor/ai/AiComposedSectionEdit";
import { AiCreateSection } from "@/components/editor/ai/AiCreateSection";
import { PageOrderList } from "@/components/editor/PageOrderList";
import { confirmAction } from "@/lib/confirm";
import { PageSeoForm } from "@/components/editor/PageSeoForm";
import {
  DeleteSectionIcon,
  SidePanelAccordion,
} from "@/components/editor/SidePanelAccordion";
import { SidePanelBannerImage } from "@/components/editor/SidePanelBannerImage";
import { ThemeColorTools } from "@/components/editor/ThemeColorTools";
import { useEditor } from "@/contexts/EditorContext";
import type { SectionType } from "@/types/page";

export function EditorSidePanel() {
  const {
    sections,
    selectedSectionId,
    addSection,
    addSectionWithContent,
    moveSection,
    removeSection,
    pageName,
  } = useEditor();
  const [showMoreBlocks, setShowMoreBlocks] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  const section = sections.find((s) => s.id === selectedSectionId);
  const selectedIndex = section
    ? sections.findIndex((s) => s.id === section.id)
    : -1;
  const canMove =
    section && !isPinnedSectionType(section.type) && selectedIndex >= 0;

  return (
    <aside className="flex max-h-[min(50vh,28rem)] w-full shrink-0 flex-col border-t border-card-border bg-card lg:max-h-none lg:w-[min(100%,24rem)] lg:border-l lg:border-t-0">
      <div className="border-b border-card-border px-4 py-3">
        <h2 className="text-sm font-semibold">Build your page</h2>
        <p className="mt-0.5 text-xs text-muted">
          Open each section below · drag blocks to reorder
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidePanelAccordion
          title="AI Section Generator"
          summary="Design a custom section"
          defaultOpen
        >
          <AiCreateSection />
        </SidePanelAccordion>

        <SidePanelAccordion title="Theme colors">
          <ThemeColorTools />
        </SidePanelAccordion>

        <SidePanelAccordion
          title="Page & SEO"
          summary={pageName || "Page settings"}
          defaultOpen={false}
        >
          <PageSeoForm />
        </SidePanelAccordion>

        <SidePanelAccordion
          title="Page order"
          summary={`${sections.length} block${sections.length === 1 ? "" : "s"}`}
          defaultOpen={false}
        >
          <p className="mb-2 text-[10px] leading-snug text-muted">
            Drag ⋮⋮ to reorder. Top bar and footer stay fixed.
          </p>
          <PageOrderList />
        </SidePanelAccordion>

        <SidePanelAccordion title="Add a block" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ADD_TYPES.map((type) => (
              <AddBlockButton
                key={type}
                type={type}
                onAdd={() => void addSection(type)}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full text-xs text-brand hover:underline"
            onClick={() => setShowMoreBlocks((v) => !v)}
          >
            {showMoreBlocks ? "Hide extra blocks" : "More block types…"}
          </button>
          {showMoreBlocks ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {MORE_ADD_TYPES.map((type) => (
                <AddBlockButton
                  key={type}
                  type={type}
                  onAdd={() => void addSection(type)}
                  compact
                />
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-dashed border-brand/40 py-2 text-xs font-semibold text-brand hover:bg-brand/5"
            onClick={() => setShowFormats((v) => !v)}
          >
            {showFormats
              ? "Hide standard layouts"
              : "Standard layouts (gallery, grids…)"}
          </button>
          {showFormats ? (
            <ul className="mt-2 space-y-1.5">
              {SECTION_FORMAT_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-card-border px-2.5 py-2 text-left hover:border-brand/40 hover:bg-brand/5"
                    onClick={() =>
                      void addSectionWithContent(
                        preset.type,
                        preset.data ?? {},
                        preset.settings
                      )
                    }
                  >
                    <span className="block text-xs font-semibold">
                      + {preset.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted">
                      {preset.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </SidePanelAccordion>

        <SidePanelAccordion
          key={selectedSectionId ?? "none"}
          title="Selected block"
          defaultOpen={false}
          summary={
            section
              ? sectionListTitle(section.type, section.data)
              : "None selected"
          }
        >
          {section ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {SECTION_DISPLAY[section.type].label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {sectionListTitle(section.type, section.data)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {canMove ? (
                    <>
                      <IconAction
                        label="Move up"
                        disabled={selectedIndex <= 1}
                        onClick={() => void moveSection(section.id, -1)}
                      >
                        ↑
                      </IconAction>
                      <IconAction
                        label="Move down"
                        disabled={
                          selectedIndex < 0 ||
                          selectedIndex >= sections.length - 2
                        }
                        onClick={() => void moveSection(section.id, 1)}
                      >
                        ↓
                      </IconAction>
                    </>
                  ) : null}
                  {!isPinnedSectionType(section.type) ? (
                    <button
                      type="button"
                      title="Delete block"
                      aria-label="Delete block"
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
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
                      <DeleteSectionIcon />
                    </button>
                  ) : null}
                </div>
              </div>
              <SidePanelBannerImage section={section} />
              <AiComposedSectionEdit section={section} />
              <p className="mt-3 rounded-lg bg-brand/10 px-3 py-2 text-xs leading-relaxed text-[var(--editor-text,#1a3a4a)]">
                Use <strong>Click to edit</strong> on the page for text and images
                {section.type === "COMPOSED" ? (
                  <>
                    , use <strong>×</strong> to remove parts
                  </>
                ) : null}
                . <strong>Edit section with AI</strong> in the edit bar or sidebar for bigger
                changes.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Select a block in the list or on the page.
            </p>
          )}
        </SidePanelAccordion>
      </div>
    </aside>
  );
}

function AddBlockButton({
  type,
  onAdd,
  compact,
}: {
  type: SectionType;
  onAdd: () => void;
  compact?: boolean;
}) {
  const { label, description } = SECTION_DISPLAY[type];
  return (
    <button
      type="button"
      onClick={onAdd}
      className={`rounded-lg border border-dashed border-card-border text-left hover:border-brand/40 hover:bg-brand/5 ${
        compact ? "px-2 py-2" : "px-2.5 py-2.5"
      }`}
    >
      <span className="block text-xs font-semibold">+ {label}</span>
      {!compact ? (
        <span className="mt-0.5 block text-[10px] leading-tight text-muted">
          {description}
        </span>
      ) : null}
    </button>
  );
}

function IconAction({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-card-border px-2 py-1 text-xs disabled:opacity-30"
    >
      {children}
    </button>
  );
}
