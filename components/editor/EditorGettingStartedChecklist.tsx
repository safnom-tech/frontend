"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor } from "@/contexts/EditorContext";

const STORAGE_PREFIX = "safnom-editor-checklist-dismissed:";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function EditorGettingStartedChecklist() {
  const {
    websiteId,
    sections,
    previewMode,
    setPreviewMode,
    startEditingSection,
    selectSection,
  } = useEditor();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(
        localStorage.getItem(`${STORAGE_PREFIX}${websiteId}`) === "1"
      );
    } catch {
      setDismissed(false);
    }
  }, [websiteId]);

  const hero = sections.find((s) => s.type === "HERO");
  const contact = sections.find((s) => s.type === "CONTACT" || s.type === "FOOTER");

  const steps = useMemo(
    () => [
      {
        id: "hero",
        label: "Edit your main headline",
        done: hero ? Boolean(str(hero.data.title)) : false,
        action: () => {
          if (hero) {
            selectSection(hero.id);
            startEditingSection(hero.id);
          }
        },
      },
      {
        id: "contact",
        label: "Add phone or contact details",
        done: contact
          ? Boolean(
              str(contact.data.phone) ||
                str(contact.data.email) ||
                str(contact.data.heading)
            )
          : false,
        action: () => {
          if (contact) {
            selectSection(contact.id);
            startEditingSection(contact.id);
          }
        },
      },
      {
        id: "preview",
        label: "Preview on phone and desktop",
        done: false,
        action: () => setPreviewMode(true),
      },
    ],
    [hero, contact, selectSection, startEditingSection, setPreviewMode]
  );

  const allDone = steps.every((s) => s.done);
  if (previewMode || dismissed || allDone) return null;

  return (
    <div className="border-b border-brand/20 bg-brand/5 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-foreground">
            Quick start — build your page in minutes
          </p>
          <ul className="mt-2 space-y-1.5">
            {steps.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  className="flex items-center gap-2 text-left text-[11px] text-muted hover:text-brand"
                  onClick={step.action}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                      step.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-card-border bg-white"
                    }`}
                  >
                    {step.done ? "✓" : ""}
                  </span>
                  {step.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="shrink-0 text-[10px] font-medium text-muted hover:text-foreground"
          onClick={() => {
            try {
              localStorage.setItem(`${STORAGE_PREFIX}${websiteId}`, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
