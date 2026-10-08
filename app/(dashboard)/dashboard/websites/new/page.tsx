"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { LazyTemplateLivePreview } from "@/components/dashboard/LazyTemplateLivePreview";
import { templateAccent } from "@/components/dashboard/TemplateDesignPreview";
import { WorkspaceRequired } from "@/components/dashboard/WorkspaceRequired";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ApiClientError } from "@/lib/api-client";
import { createWebsiteFromTemplateAndOpenEditor } from "@/lib/createWebsiteFromTemplate";
import { hasBusinessName } from "@/types/business-profile";
import * as aiApi from "@/services/ai.api";
import * as templatesApi from "@/services/templates.api";
import * as websitesApi from "@/services/websites.api";
import type { TemplateSummary } from "@/types/template";

type Mode = "manual" | "ai";

const FEATURED_TEMPLATE_ID = "ocean-crown";
const TEMPLATE_PAGE_SIZE = 20;

function NewWebsiteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetTemplate = searchParams.get("template") ?? FEATURED_TEMPLATE_ID;
  const { currentWorkspace } = useWorkspace();
  const [mode, setMode] = useState<Mode>("manual");
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(presetTemplate);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templatesTotal, setTemplatesTotal] = useState(0);
  const [loadingMoreTemplates, setLoadingMoreTemplates] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [location, setLocation] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [websiteStyle, setWebsiteStyle] = useState("Modern and professional");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoverCardId, setHoverCardId] = useState<string | null>(null);
  const [showAllThemes, setShowAllThemes] = useState(false);

  const templateFromQuery = searchParams.get("template");
  const selectedTemplate = templates.find((t) => t.id === templateId);
  const customizeMode =
    Boolean(templateFromQuery) &&
    Boolean(selectedTemplate) &&
    selectedTemplate?.id === templateFromQuery &&
    !showAllThemes;

  useEffect(() => {
    void templatesApi
      .listTemplates({ limit: TEMPLATE_PAGE_SIZE, offset: 0 })
      .then((res) => {
        setTemplates(res.data.templates);
        setTemplatesTotal(res.data.total);
        const fromQuery = searchParams.get("template");
        if (fromQuery && res.data.templates.some((t) => t.id === fromQuery)) {
          setTemplateId(fromQuery);
        } else if (
          res.data.templates.some((t) => t.id === FEATURED_TEMPLATE_ID)
        ) {
          setTemplateId(FEATURED_TEMPLATE_ID);
        }
      })
      .catch(() => {
        setTemplates([]);
        setTemplatesTotal(0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from query
  }, [searchParams]);

  async function loadMoreTemplates() {
    if (loadingMoreTemplates || templates.length >= templatesTotal) return;
    setLoadingMoreTemplates(true);
    try {
      const res = await templatesApi.listTemplates({
        limit: TEMPLATE_PAGE_SIZE,
        offset: templates.length,
      });
      setTemplates((prev) => [...prev, ...res.data.templates]);
      setTemplatesTotal(res.data.total);
    } catch {
      // keep existing list
    } finally {
      setLoadingMoreTemplates(false);
    }
  }

  const profileReady = hasBusinessName(currentWorkspace?.businessProfile);

  useEffect(() => {
    const bn = currentWorkspace?.businessProfile?.businessName?.trim();
    if (bn && !name) setName(bn);
  }, [currentWorkspace, name]);

  async function onSubmitManual(e: React.FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    if (!profileReady) {
      setError("Add your business profile first (name, logo, contact details).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (templateId) {
        await createWebsiteFromTemplateAndOpenEditor(
          currentWorkspace.id,
          templateId,
          router
        );
        return;
      }
      const res = await websitesApi.createWebsite(currentWorkspace.id, {});
      router.push(`/dashboard/websites/${res.data.id}`);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not create website"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitAi(e: React.FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSubmitting(true);
    setError(null);
    try {
      const services = servicesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await aiApi.generateWebsiteWithAi(currentWorkspace.id, {
        businessName: name.trim(),
        businessType: businessType.trim(),
        businessDescription: businessDescription.trim(),
        location: location.trim(),
        services: services.length ? services : ["General service"],
        websiteStyle: websiteStyle.trim(),
      });
      const home =
        res.data.pages.find((p) => p.slug === "home") ?? res.data.pages[0];
      if (home) {
        router.push(
          `/dashboard/websites/${res.data.website.id}/editor/${home.id}`
        );
      } else {
        router.push(`/dashboard/websites/${res.data.website.id}`);
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "AI generation failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceRequired>
      <div className="w-full max-w-none">
        <Link
          href="/dashboard/websites"
          className="mb-4 inline-block text-sm text-muted hover:text-brand"
        >
          ← Websites
        </Link>
        <DashboardPageHeader
          title={customizeMode ? "Customize in editor" : "Create website"}
          description={
            customizeMode && selectedTemplate
              ? `You chose ${selectedTemplate.name}. We will create your site and open the page builder so you can edit text and images.`
              : "Pick a design — your business name, logo, and contact info come from Business profile."
          }
        />
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs ${mode === "manual" ? "bg-brand/15 font-semibold" : "border border-card-border"}`}
            onClick={() => setMode("manual")}
          >
            Template
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs ${mode === "ai" ? "bg-brand/15 font-semibold" : "border border-card-border"}`}
            onClick={() => setMode("ai")}
          >
            Generate with AI
          </button>
        </div>

        {mode === "manual" ? (
          <form
            onSubmit={(e) => void onSubmitManual(e)}
            className="space-y-6"
          >
            {error ? <Alert tone="error">{error}</Alert> : null}

            {!profileReady ? (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                Set up your{" "}
                <Link href="/dashboard/business" className="font-semibold text-brand">
                  business profile
                </Link>{" "}
                once — then any theme will use your name, logo, phone, and social
                links automatically.
              </div>
            ) : (
              <p className="text-sm text-muted">
                Using{" "}
                <span className="font-medium text-[var(--dash-ink)]">
                  {currentWorkspace?.businessProfile?.businessName}
                </span>{" "}
                from your profile.{" "}
                <Link href="/dashboard/business" className="text-brand hover:underline">
                  Edit details
                </Link>
              </p>
            )}

            <div>
              {customizeMode && selectedTemplate ? (
                <div className="dashboard-panel overflow-hidden border-2 border-brand ring-2 ring-brand/20">
                  <div
                    className="relative aspect-[16/11] min-h-[280px] border-b border-card-border sm:min-h-[360px]"
                    onMouseEnter={() => setHoverCardId(selectedTemplate.id)}
                    onMouseLeave={() => setHoverCardId(null)}
                  >
                    <LazyTemplateLivePreview
                      templateId={selectedTemplate.id}
                      className="h-full w-full"
                      hovering={hoverCardId === selectedTemplate.id}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold">{selectedTemplate.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {selectedTemplate.category}
                    </p>
                    <button
                      type="button"
                      className="mt-3 text-xs font-medium text-brand hover:underline"
                      onClick={() => setShowAllThemes(true)}
                    >
                      Choose a different design…
                    </button>
                  </div>
                </div>
              ) : (
                <>
              <h2 className="mb-3 text-sm font-semibold">
                Choose a design (hover card to scroll the full page)
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {templates.map((t) => {
                  const selected = templateId === t.id;
                  const isFeatured = t.id === FEATURED_TEMPLATE_ID;
                  return (
                    <div
                      key={t.id}
                      className={`dashboard-panel overflow-hidden transition ${
                        selected
                          ? "border-2 border-brand ring-2 ring-brand/30 shadow-md shadow-brand/10"
                          : "border border-card-border hover:border-brand/40"
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setTemplateId(t.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setTemplateId(t.id);
                          }
                        }}
                        onMouseEnter={() => setHoverCardId(t.id)}
                        onMouseLeave={() => setHoverCardId(null)}
                        className="relative aspect-[16/11] min-h-[280px] cursor-pointer border-b border-card-border sm:min-h-[360px] lg:min-h-[420px]"
                        aria-label={`Select ${t.name}`}
                      >
                        <LazyTemplateLivePreview
                          templateId={t.id}
                          className="h-full w-full"
                          hovering={hoverCardId === t.id}
                        />
                        {isFeatured ? (
                          <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            Recommended
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        ) : null}
                        <a
                          href={`/dashboard/websites/themes/${encodeURIComponent(t.id)}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-2 right-2 z-20 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[var(--dash-ink)] shadow-sm ring-1 ring-black/10 hover:bg-white"
                        >
                          Preview
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTemplateId(t.id)}
                        className={`w-full p-3 text-left ${selected ? "bg-brand/5" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={
                              selected
                                ? "font-semibold text-brand"
                                : "font-semibold"
                            }
                          >
                            {t.name}
                          </span>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: selected
                                ? "var(--brand, #3da6ad)"
                                : templateAccent(t),
                            }}
                            aria-hidden
                          />
                        </div>
                        <p
                          className={`mt-0.5 text-xs ${
                            selected ? "font-medium text-brand/80" : "text-muted"
                          }`}
                        >
                          {t.category}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
              {templates.length > 0 && templates.length < templatesTotal ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loadingMoreTemplates}
                    onClick={() => void loadMoreTemplates()}
                    className="rounded-lg px-4 py-2 text-sm"
                  >
                    {loadingMoreTemplates ? "Loading…" : "Load more themes"}
                  </Button>
                </div>
              ) : null}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTemplateId("")}
                  className={`dashboard-panel overflow-hidden text-left transition ${
                    templateId === ""
                      ? "border-2 border-brand ring-2 ring-brand/30 shadow-md shadow-brand/10"
                      : "border border-card-border hover:border-brand/40"
                  }`}
                >
                  <div className="flex aspect-[16/11] min-h-[280px] items-center justify-center border-b border-card-border bg-[var(--dash-main)] text-sm text-muted sm:min-h-[360px] lg:min-h-[420px]">
                    Blank site
                  </div>
                  <div
                    className={`p-3 ${templateId === "" ? "bg-brand/5" : ""}`}
                  >
                    <span
                      className={
                        templateId === ""
                          ? "font-semibold text-brand"
                          : "font-semibold"
                      }
                    >
                      Blank
                    </span>
                    <p
                      className={`mt-0.5 text-xs ${
                        templateId === ""
                          ? "font-medium text-brand/80"
                          : "text-muted"
                      }`}
                    >
                      Start from an empty page
                    </p>
                  </div>
                </button>
              </div>
                </>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting || !profileReady}
              className="px-6"
            >
              {submitting
                ? "Creating…"
                : customizeMode
                  ? "Open in editor"
                  : templateId
                    ? "Use selected design"
                    : "Create blank site"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => void onSubmitAi(e)}
            className="dashboard-panel space-y-4 p-6"
          >
            {error ? <Alert tone="error">{error}</Alert> : null}
            <p className="text-xs text-muted">
              Generation usually takes 15–60 seconds. Keep this tab open until
              it finishes.
            </p>
            <FieldLabel htmlFor="ai-name">Business name</FieldLabel>
            <Input
              id="ai-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FieldLabel htmlFor="ai-type">Business type</FieldLabel>
            <Input
              id="ai-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            />
            <div>
              <FieldLabel htmlFor="ai-desc">Business description</FieldLabel>
              <textarea
                id="ai-desc"
                className="input-field min-h-[80px] w-full rounded-lg text-sm"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                required
              />
            </div>
            <FieldLabel htmlFor="ai-loc">Location</FieldLabel>
            <Input
              id="ai-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <div>
              <FieldLabel htmlFor="ai-services">
                Services (one per line)
              </FieldLabel>
              <textarea
                id="ai-services"
                className="input-field min-h-[72px] w-full rounded-lg text-sm"
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
              />
            </div>
            <FieldLabel htmlFor="ai-style">Website style</FieldLabel>
            <Input
              id="ai-style"
              value={websiteStyle}
              onChange={(e) => setWebsiteStyle(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Generating…" : "Generate website"}
            </Button>
          </form>
        )}
      </div>
    </WorkspaceRequired>
  );
}

export default function NewWebsitePage() {
  return (
    <Suspense
      fallback={
        <WorkspaceRequired>
          <p className="text-sm text-muted">Loading…</p>
        </WorkspaceRequired>
      }
    >
      <NewWebsiteForm />
    </Suspense>
  );
}
