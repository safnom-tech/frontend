"use client";

import { PreviewViewportBar } from "@/components/editor/PreviewViewportBar";
import { SectionRenderer } from "@/components/editor/SectionRenderer";
import {
  FullscreenPreviewControls,
  previewFrameClassName,
  previewMainClassName,
  showMobilePreviewChrome,
} from "@/components/site/PreviewViewportFrame";
import { WebsiteRenderer } from "@/components/site/WebsiteRenderer";
import {
  followsLogisticsHero,
  SERVICE_CARDS_OVER_HERO_WRAPPER_CLASS,
} from "@/components/editor/sections/sectionLayout";
import {
  normalizeWebsiteTheme,
  themeColorKey,
  themeCssVars,
} from "@/components/editor/sections/sectionStyles";
import { isFullscreenViewport } from "@/components/site/viewport";
import { useEditor } from "@/contexts/EditorContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function WebsiteCanvas() {
  const {
    sections,
    selectedSectionId,
    editingSectionId,
    selectSection,
    startEditingSection,
    theme,
    previewMode,
    viewport,
    websiteId,
    website,
    setViewport,
    setPreviewMode,
  } = useEditor();
  const { currentWorkspace } = useWorkspace();

  if (previewMode) {
    const inquiryTarget =
      currentWorkspace && website
        ? {
            workspaceId: website.workspaceId || currentWorkspace.id,
            websitePublicId: website.publicId,
            websiteId,
            websiteName: website.name,
          }
        : null;
    const immersive = isFullscreenViewport(viewport);
    return (
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {!immersive ? <PreviewViewportBar /> : null}
        <FullscreenPreviewControls
          viewport={viewport}
          onViewportChange={setViewport}
        >
          <button
            type="button"
            className="rounded-full border border-card-border px-3 py-1.5 font-medium hover:bg-black/[0.04]"
            onClick={() => {
              setViewport("desktop");
              setPreviewMode(false);
            }}
          >
            Back to editing
          </button>
        </FullscreenPreviewControls>
        <main className={previewMainClassName(viewport)}>
          <div
            className={
              immersive
                ? "min-h-full w-full"
                : "flex w-full flex-col items-center"
            }
          >
            <div className={previewFrameClassName(viewport)}>
              {showMobilePreviewChrome(viewport) ? (
                <div className="flex h-6 items-center justify-center border-b border-black/5 bg-black/[0.03]">
                  <span className="h-1 w-12 rounded-full bg-black/15" aria-hidden />
                </div>
              ) : null}
              <WebsiteRenderer
                key={themeColorKey(theme)}
                theme={theme}
                sections={sections}
                emptyMessage="Exit preview and add blocks to see your page here."
                revealOnScroll
                inquiryTarget={inquiryTarget}
              />
            </div>
            {!immersive ? (
              <p className="mt-4 text-center text-[11px] text-muted">
                Draft editor — changes apply after you publish
              </p>
            ) : null}
          </div>
        </main>
      </div>
    );
  }

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#dfe4e8]">
      <div
        key={themeColorKey(normalizeWebsiteTheme(theme))}
        style={{
          ...themeCssVars(normalizeWebsiteTheme(theme)),
          background: "var(--site-bg, #fff)",
          color: "var(--site-text, inherit)",
        }}
        className="@container/site min-h-full w-full shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
        onClick={() => selectSection(null)}
      >
        {sections.length === 0 ? (
          <div className="flex min-h-[min(100dvh-8rem,640px)] flex-col items-center justify-center p-8 text-center">
            <p className="text-lg font-medium">Your page is empty</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Add a block from the panel on the right, then use Click to edit on
              the page.
            </p>
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionRenderer
              key={section.id}
              section={section}
              selected={selectedSectionId === section.id}
              editing={editingSectionId === section.id}
              onStartEdit={() => startEditingSection(section.id)}
              theme={theme}
              previewMode={false}
              layoutClassName={
                followsLogisticsHero(sections, index)
                  ? SERVICE_CARDS_OVER_HERO_WRAPPER_CLASS
                  : undefined
              }
            />
          ))
        )}
      </div>
    </main>
  );
}
