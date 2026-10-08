"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSectionData,
  defaultSectionSettings,
} from "@/components/editor/sectionDefaults";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { notify, apiErrorMessage } from "@/lib/notify";
import * as pagesApi from "@/services/pages.api";
import * as websitesApi from "@/services/websites.api";
import type {
  EditorSaveStatus,
  EditorSnapshot,
  EditorThemeDraft,
  EditorViewport,
  SectionStyleSettings,
} from "@/types/editor";
import { isPinnedSectionType } from "@/components/editor/editorUiConstants";
import { normalizeWebsiteTheme } from "@/components/editor/sections/sectionStyles";
import {
  applyThemeColorKeyChange,
  replaceColorAcrossSite,
} from "@/lib/themeColorReplace";
import type { PageSection, PageSeo, SectionType } from "@/types/page";
import type { Website } from "@/types/website";

function sortSections(sections: PageSection[]): PageSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

/** Header first, footer last; middle blocks keep relative order. */
export function mergeSectionOrder(
  sorted: PageSection[],
  middleIds: string[]
): string[] {
  const header = sorted.find((s) => s.type === "HEADER");
  const footer = sorted.find((s) => s.type === "FOOTER");
  const middleSet = new Set(middleIds);
  const middle = middleIds
    .map((id) => sorted.find((s) => s.id === id))
    .filter((s): s is PageSection => !!s && middleSet.has(s.id));
  const ids: string[] = [];
  if (header) ids.push(header.id);
  for (const s of middle) {
    if (!isPinnedSectionType(s.type)) ids.push(s.id);
  }
  if (footer) ids.push(footer.id);
  return ids;
}

export function middleSectionIds(sorted: PageSection[]): string[] {
  return sorted
    .filter((s) => !isPinnedSectionType(s.type))
    .map((s) => s.id);
}

function snapshotsEqual(
  a: EditorSnapshot,
  b: EditorSnapshot
): boolean {
  return (
    JSON.stringify(a.sections) === JSON.stringify(b.sections) &&
    JSON.stringify(a.theme) === JSON.stringify(b.theme)
  );
}

interface EditorContextValue {
  websiteId: string;
  pageId: string;
  website: Website | null;
  pageName: string;
  pageSlug: string;
  pageSeo: PageSeo;
  sections: PageSection[];
  minimizedSectionIds: string[];
  selectedSectionId: string | null;
  /** Block with inline edit toolbar open (only via Click to edit). */
  editingSectionId: string | null;
  viewport: EditorViewport;
  previewMode: boolean;
  saveStatus: EditorSaveStatus;
  saveError: string | null;
  dirty: boolean;
  theme: EditorThemeDraft;
  /** Theme colors saved on this site when the editor loaded. */
  defaultTheme: EditorThemeDraft;
  useDefaultThemeColors: boolean;
  setUseDefaultThemeColors: (enabled: boolean) => void;
  resetThemeColorsToDefault: () => void;
  loading: boolean;
  loadError: string | null;
  selectSection: (id: string | null) => void;
  startEditingSection: (id: string) => void;
  stopEditingSection: () => void;
  setViewport: (v: EditorViewport) => void;
  setPreviewMode: (v: boolean) => void;
  updateSectionData: (sectionId: string, data: Record<string, unknown>) => void;
  updateSectionSettings: (
    sectionId: string,
    settings: SectionStyleSettings
  ) => void;
  /** Apply section draft and persist immediately (no autosave). */
  commitSectionAndSave: (
    sectionId: string,
    data: Record<string, unknown>,
    settings: SectionStyleSettings
  ) => Promise<void>;
  updateTheme: (theme: EditorThemeDraft) => void;
  setThemeColorKey: (
    key: "primary" | "secondary" | "background" | "text",
    value: string
  ) => void;
  replaceThemeColor: (fromColor: string, toColor: string) => void;
  updatePageMeta: (patch: {
    name?: string;
    slug?: string;
    seo?: Partial<PageSeo>;
  }) => void;
  toggleSectionMinimized: (sectionId: string) => void;
  isSectionMinimized: (sectionId: string) => boolean;
  addSection: (type: SectionType) => Promise<void>;
  addSectionWithContent: (
    type: SectionType,
    data: Record<string, unknown>,
    settings?: Record<string, unknown>
  ) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  duplicateSection: (sectionId: string) => Promise<void>;
  moveSection: (sectionId: string, direction: -1 | 1) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;
  save: () => Promise<void>;
  /** Persist pending debounced changes immediately. */
  flushAutosave: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  reload: () => Promise<void>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  websiteId,
  pageId,
  children,
}: {
  websiteId: string;
  pageId: string;
  children: ReactNode;
}) {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const [website, setWebsite] = useState<Website | null>(null);
  const [pageName, setPageName] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageSeo, setPageSeo] = useState<PageSeo>({
    title: null,
    metaDescription: null,
    socialImage: null,
  });
  const [pageMetaDirty, setPageMetaDirty] = useState(false);
  const [minimizedSectionIds, setMinimizedSectionIds] = useState<string[]>(
    []
  );
  const [sections, setSections] = useState<PageSection[]>([]);
  const [theme, setTheme] = useState<EditorThemeDraft>({});
  const [defaultTheme, setDefaultTheme] = useState<EditorThemeDraft>({});
  const [useDefaultThemeColors, setUseDefaultThemeColors] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(
    null
  );
  const [viewport, setViewport] = useState<EditorViewport>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const savedSnapshot = useRef<EditorSnapshot>({ sections: [], theme: {} });
  const savedPageMeta = useRef({
    name: "",
    slug: "",
    seo: { title: null, metaDescription: null, socialImage: null } as PageSeo,
  });
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeRef = useRef<EditorThemeDraft>({});
  const sectionsRef = useRef<PageSection[]>([]);
  const saveFnRef = useRef<() => Promise<void>>(async () => {});
  const historyPast = useRef<EditorSnapshot[]>([]);
  const historyFuture = useRef<EditorSnapshot[]>([]);
  const historyPending = useRef<EditorSnapshot | null>(null);
  const historyCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingHistory = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const currentSnapshot = useMemo(
    (): EditorSnapshot => ({ sections, theme }),
    [sections, theme]
  );

  const dirty = useMemo(() => {
    if (!snapshotsEqual(currentSnapshot, savedSnapshot.current)) return true;
    if (pageMetaDirty) return true;
    return (
      pageName !== savedPageMeta.current.name ||
      pageSlug !== savedPageMeta.current.slug ||
      JSON.stringify(pageSeo) !== JSON.stringify(savedPageMeta.current.seo)
    );
  }, [currentSnapshot, pageMetaDirty, pageName, pageSlug, pageSeo]);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [siteRes, pageRes] = await Promise.all([
        websitesApi.getWebsite(workspaceId, websiteId),
        pagesApi.getPage(workspaceId, websiteId, pageId),
      ]);
      setWebsite(siteRes.data);
      setPageName(pageRes.data.name);
      setPageSlug(pageRes.data.slug);
      const seo = pageRes.data.seo ?? {
        title: null,
        metaDescription: null,
        socialImage: null,
      };
      setPageSeo(seo);
      setPageMetaDirty(false);
      savedPageMeta.current = {
        name: pageRes.data.name,
        slug: pageRes.data.slug,
        seo,
      };
      const sorted = sortSections(pageRes.data.sections);
      setSections(sorted);
      const loadedTheme = normalizeWebsiteTheme(siteRes.data.theme ?? {});
      setDefaultTheme(loadedTheme);
      setUseDefaultThemeColors(false);
      setTheme(loadedTheme);
      savedSnapshot.current = {
        sections: sorted,
        theme: loadedTheme,
      };
      historyPast.current = [];
      historyFuture.current = [];
      historyPending.current = null;
      setHistoryVersion((v) => v + 1);
      setMinimizedSectionIds([]);
      setSaveStatus("idle");
      setSaveError(null);
    } catch (err) {
      const message = apiErrorMessage(err, "Failed to load editor");
      setLoadError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, websiteId, pageId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async () => {
    if (!workspaceId || !dirty) {
      if (!dirty) setSaveStatus("saved");
      return;
    }
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const saved = savedSnapshot.current;
      for (const section of sections) {
        const prev = saved.sections.find((s) => s.id === section.id);
        if (
          !prev ||
          JSON.stringify(prev.data) !== JSON.stringify(section.data) ||
          JSON.stringify(prev.settings) !== JSON.stringify(section.settings)
        ) {
          await pagesApi.updateSection(
            workspaceId,
            websiteId,
            pageId,
            section.id,
            { data: section.data, settings: section.settings }
          );
        }
      }
      if (JSON.stringify(saved.theme) !== JSON.stringify(theme)) {
        const siteRes = await websitesApi.updateWebsite(
          workspaceId,
          websiteId,
          { theme }
        );
        setWebsite(siteRes.data);
      }
      if (
        pageMetaDirty ||
        pageName !== savedPageMeta.current.name ||
        pageSlug !== savedPageMeta.current.slug ||
        JSON.stringify(pageSeo) !== JSON.stringify(savedPageMeta.current.seo)
      ) {
        const pageRes = await pagesApi.updatePage(
          workspaceId,
          websiteId,
          pageId,
          { name: pageName, slug: pageSlug, seo: pageSeo }
        );
        setPageName(pageRes.data.name);
        setPageSlug(pageRes.data.slug);
        setPageSeo(pageRes.data.seo);
        savedPageMeta.current = {
          name: pageRes.data.name,
          slug: pageRes.data.slug,
          seo: pageRes.data.seo,
        };
        setPageMetaDirty(false);
      }
      savedSnapshot.current = { sections, theme };
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      const message = apiErrorMessage(err, "Save failed");
      setSaveError(message);
      notify.error(message);
    }
  }, [
    workspaceId,
    websiteId,
    pageId,
    sections,
    theme,
    dirty,
    pageName,
    pageSlug,
    pageSeo,
    pageMetaDirty,
  ]);

  useEffect(() => {
    saveFnRef.current = save;
  }, [save]);

  const bumpHistory = useCallback(() => {
    setHistoryVersion((v) => v + 1);
  }, []);

  const cloneEditorSnapshot = useCallback((): EditorSnapshot => {
    return JSON.parse(
      JSON.stringify({
        sections: sectionsRef.current,
        theme: themeRef.current,
      })
    ) as EditorSnapshot;
  }, []);

  const commitHistoryEntry = useCallback(() => {
    if (historyPending.current) {
      historyPast.current.push(historyPending.current);
      if (historyPast.current.length > 25) {
        historyPast.current.shift();
      }
      historyFuture.current = [];
      historyPending.current = null;
      bumpHistory();
    }
  }, [bumpHistory]);

  const noteUserEdit = useCallback(() => {
    if (isApplyingHistory.current) return;
    if (!historyPending.current) {
      historyPending.current = cloneEditorSnapshot();
    }
    if (historyCommitTimer.current) {
      clearTimeout(historyCommitTimer.current);
    }
    historyCommitTimer.current = setTimeout(() => {
      commitHistoryEntry();
    }, 900);
  }, [cloneEditorSnapshot, commitHistoryEntry]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void saveFnRef.current();
    }, 900);
  }, []);

  const flushAutosave = useCallback(async () => {
    commitHistoryEntry();
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    await saveFnRef.current();
  }, [commitHistoryEntry]);

  const applyHistorySnapshot = useCallback(
    (snap: EditorSnapshot) => {
      isApplyingHistory.current = true;
      sectionsRef.current = snap.sections;
      themeRef.current = snap.theme;
      setSections(snap.sections);
      setTheme(snap.theme);
      setSaveStatus("idle");
      isApplyingHistory.current = false;
      scheduleAutosave();
      bumpHistory();
    },
    [scheduleAutosave, bumpHistory]
  );

  const undo = useCallback(() => {
    commitHistoryEntry();
    const past = historyPast.current;
    if (past.length === 0) return;
    historyFuture.current.push(cloneEditorSnapshot());
    const prev = past.pop()!;
    applyHistorySnapshot(prev);
  }, [commitHistoryEntry, cloneEditorSnapshot, applyHistorySnapshot]);

  const redo = useCallback(() => {
    const future = historyFuture.current;
    if (future.length === 0) return;
    historyPast.current.push(cloneEditorSnapshot());
    const next = future.pop()!;
    applyHistorySnapshot(next);
  }, [cloneEditorSnapshot, applyHistorySnapshot]);

  const canUndo = useMemo(
    () => historyPast.current.length > 0 || historyPending.current !== null,
    [historyVersion]
  );
  const canRedo = useMemo(
    () => historyFuture.current.length > 0,
    [historyVersion]
  );

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      if (historyCommitTimer.current) clearTimeout(historyCommitTimer.current);
    };
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty && saveStatus !== "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, saveStatus]);

  const updateSectionData = useCallback(
    (sectionId: string, data: Record<string, unknown>) => {
      noteUserEdit();
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, data } : s))
      );
      setSaveStatus("idle");
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const updateSectionSettings = useCallback(
    (sectionId: string, settings: SectionStyleSettings) => {
      noteUserEdit();
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, settings: settings as Record<string, unknown> }
            : s
        )
      );
      setSaveStatus("idle");
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const commitSectionAndSave = useCallback(
    async (
      sectionId: string,
      data: Record<string, unknown>,
      settings: SectionStyleSettings
    ) => {
      if (!workspaceId) return;
      const nextSections = sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              data,
              settings: settings as Record<string, unknown>,
            }
          : s
      );
      setSections(nextSections);
      setSaveStatus("saving");
      setSaveError(null);
      try {
        const saved = savedSnapshot.current;
        for (const section of nextSections) {
          const prev = saved.sections.find((s) => s.id === section.id);
          if (
            !prev ||
            JSON.stringify(prev.data) !== JSON.stringify(section.data) ||
            JSON.stringify(prev.settings) !== JSON.stringify(section.settings)
          ) {
            await pagesApi.updateSection(
              workspaceId,
              websiteId,
              pageId,
              section.id,
              { data: section.data, settings: section.settings }
            );
          }
        }
        if (JSON.stringify(saved.theme) !== JSON.stringify(theme)) {
          const siteRes = await websitesApi.updateWebsite(
            workspaceId,
            websiteId,
            { theme }
          );
          setWebsite(siteRes.data);
        }
        savedSnapshot.current = { sections: nextSections, theme };
        setSaveStatus("saved");
      } catch (err) {
        setSaveStatus("error");
        const message = apiErrorMessage(err, "Save failed");
        setSaveError(message);
        notify.error(message);
        throw err;
      }
    },
    [workspaceId, websiteId, pageId, sections, theme]
  );

  const updateTheme = useCallback(
    (next: EditorThemeDraft) => {
      noteUserEdit();
      setTheme(next);
      setSaveStatus("idle");
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const applyDefaultThemeColors = useCallback(() => {
    noteUserEdit();
    const normalized = normalizeWebsiteTheme(defaultTheme);
    themeRef.current = normalized;
    setTheme(normalized);
    setUseDefaultThemeColors(true);
    setSaveStatus("idle");
    scheduleAutosave();
  }, [defaultTheme, noteUserEdit, scheduleAutosave]);

  const setUseDefaultThemeColorsWrapped = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        applyDefaultThemeColors();
        return;
      }
      setUseDefaultThemeColors(false);
    },
    [applyDefaultThemeColors]
  );

  const setThemeColorKey = useCallback(
    (
      key: "primary" | "secondary" | "background" | "text",
      value: string
    ) => {
      noteUserEdit();
      setUseDefaultThemeColors(false);
      const { theme: nextTheme, sections: nextSections } =
        applyThemeColorKeyChange(
          themeRef.current,
          sectionsRef.current,
          key,
          value
        );
      themeRef.current = nextTheme;
      sectionsRef.current = nextSections;
      setTheme(nextTheme);
      setSections(nextSections);
      setSaveStatus("idle");
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const replaceThemeColor = useCallback(
    (fromColor: string, toColor: string) => {
      noteUserEdit();
      setUseDefaultThemeColors(false);
      const { theme: nextTheme, sections: nextSections } =
        replaceColorAcrossSite(
          themeRef.current,
          sectionsRef.current,
          fromColor,
          toColor
        );
      themeRef.current = normalizeWebsiteTheme(nextTheme);
      sectionsRef.current = nextSections;
      setTheme(themeRef.current);
      setSections(nextSections);
      setSaveStatus("idle");
      noteUserEdit();
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const updatePageMeta = useCallback(
    (patch: {
      name?: string;
      slug?: string;
      seo?: Partial<PageSeo>;
    }) => {
      noteUserEdit();
      if (patch.name !== undefined) setPageName(patch.name);
      if (patch.slug !== undefined) setPageSlug(patch.slug);
      if (patch.seo) setPageSeo((prev) => ({ ...prev, ...patch.seo }));
      setPageMetaDirty(true);
      setSaveStatus("idle");
      scheduleAutosave();
    },
    [noteUserEdit, scheduleAutosave]
  );

  const toggleSectionMinimized = useCallback((sectionId: string) => {
    setMinimizedSectionIds((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const isSectionMinimized = useCallback(
    (sectionId: string) => minimizedSectionIds.includes(sectionId),
    [minimizedSectionIds]
  );

  const addSection = useCallback(
    async (type: SectionType) => {
      if (!workspaceId) return;
      try {
        const created = await pagesApi.addSection(
          workspaceId,
          websiteId,
          pageId,
          {
            type,
            data: defaultSectionData(type),
            settings: defaultSectionSettings(type),
          }
        );
        setSections((prev) => sortSections([...prev, created.data]));
        setSelectedSectionId(created.data.id);
        savedSnapshot.current = {
          ...savedSnapshot.current,
          sections: sortSections([
            ...savedSnapshot.current.sections,
            created.data,
          ]),
        };
      } catch (err) {
        const message = apiErrorMessage(err, "Could not add section");
        setSaveError(message);
        notify.error(message);
      }
    },
    [workspaceId, websiteId, pageId]
  );

  const addSectionWithContent = useCallback(
    async (
      type: SectionType,
      data: Record<string, unknown>,
      settings?: Record<string, unknown>
    ) => {
      if (!workspaceId) return;
      try {
        const created = await pagesApi.addSection(
          workspaceId,
          websiteId,
          pageId,
          {
            type,
            data,
            settings: settings ?? defaultSectionSettings(type),
          }
        );
        setSections((prev) => sortSections([...prev, created.data]));
        setSelectedSectionId(created.data.id);
        savedSnapshot.current = {
          ...savedSnapshot.current,
          sections: sortSections([
            ...savedSnapshot.current.sections,
            created.data,
          ]),
        };
      } catch (err) {
        const message = apiErrorMessage(err, "Could not add section");
        setSaveError(message);
        notify.error(message);
      }
    },
    [workspaceId, websiteId, pageId]
  );

  const removeSection = useCallback(
    async (sectionId: string) => {
      if (!workspaceId) return;
      const target = sections.find((s) => s.id === sectionId);
      if (target && isPinnedSectionType(target.type)) {
        const message = "Top bar and footer cannot be removed from here.";
        setSaveError(message);
        notify.warning(message);
        return;
      }
      try {
        await pagesApi.deleteSection(
          workspaceId,
          websiteId,
          pageId,
          sectionId
        );
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        if (selectedSectionId === sectionId) setSelectedSectionId(null);
        if (editingSectionId === sectionId) setEditingSectionId(null);
        savedSnapshot.current = {
          ...savedSnapshot.current,
          sections: savedSnapshot.current.sections.filter(
            (s) => s.id !== sectionId
          ),
        };
      } catch (err) {
        const message = apiErrorMessage(err, "Could not remove block");
        setSaveError(message);
        notify.error(message);
      }
    },
    [workspaceId, websiteId, pageId, selectedSectionId, editingSectionId, sections]
  );

  const duplicateSection = useCallback(
    async (sectionId: string) => {
      if (!workspaceId) return;
      try {
        await pagesApi.duplicateSection(
          workspaceId,
          websiteId,
          pageId,
          sectionId
        );
        await reload();
      } catch (err) {
        const message = apiErrorMessage(err, "Could not duplicate block");
        setSaveError(message);
        notify.error(message);
      }
    },
    [workspaceId, websiteId, pageId, reload]
  );

  const reorderSections = useCallback(
    async (orderedIds: string[]) => {
      if (!workspaceId) return;
      const sorted = sortSections(sections);
      const middle = middleSectionIds(sorted);
      const merged = mergeSectionOrder(sorted, orderedIds.filter((id) => middle.includes(id)));
      if (merged.length !== sorted.length) return;
      try {
        const res = await pagesApi.reorderSections(
          workspaceId,
          websiteId,
          pageId,
          merged
        );
        const next = sortSections(res.data.sections);
        setSections(next);
        savedSnapshot.current = {
          ...savedSnapshot.current,
          sections: next,
        };
      } catch (err) {
        const message = apiErrorMessage(err, "Could not reorder blocks");
        setSaveError(message);
        notify.error(message);
      }
    },
    [workspaceId, websiteId, pageId, sections]
  );

  const moveSection = useCallback(
    async (sectionId: string, direction: -1 | 1) => {
      const sorted = sortSections(sections);
      const middle = middleSectionIds(sorted);
      const index = middle.indexOf(sectionId);
      if (index < 0) return;
      const target = index + direction;
      if (target < 0 || target >= middle.length) return;
      const nextMiddle = [...middle];
      [nextMiddle[index], nextMiddle[target]] = [
        nextMiddle[target],
        nextMiddle[index],
      ];
      await reorderSections(nextMiddle);
    },
    [sections, reorderSections]
  );

  const value: EditorContextValue = {
    websiteId,
    pageId,
    website,
    pageName,
    pageSlug,
    pageSeo,
    sections: sortSections(sections),
    minimizedSectionIds,
    selectedSectionId,
    editingSectionId,
    viewport,
    previewMode,
    saveStatus,
    saveError,
    dirty,
    theme,
    defaultTheme,
    useDefaultThemeColors,
    setUseDefaultThemeColors: setUseDefaultThemeColorsWrapped,
    resetThemeColorsToDefault: applyDefaultThemeColors,
    loading,
    loadError,
    selectSection: (id: string | null) => {
      setSelectedSectionId(id);
      if (id === null) setEditingSectionId(null);
    },
    startEditingSection: (id: string) => {
      setSelectedSectionId(id);
      setEditingSectionId(id);
    },
    stopEditingSection: () => setEditingSectionId(null),
    setViewport,
    setPreviewMode,
    updateSectionData,
    updateSectionSettings,
    commitSectionAndSave,
    updateTheme,
    setThemeColorKey,
    replaceThemeColor,
    updatePageMeta,
    toggleSectionMinimized,
    isSectionMinimized,
    addSection,
    addSectionWithContent,
    removeSection,
    duplicateSection,
    moveSection,
    reorderSections,
    save,
    flushAutosave,
    canUndo,
    canRedo,
    undo,
    redo,
    reload,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useOptionalEditor() {
  return useContext(EditorContext);
}

export function useEditor() {
  const ctx = useOptionalEditor();
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return ctx;
}
