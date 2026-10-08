"use client";

import { useState } from "react";
import {
  isPinnedSectionType,
  sectionListTitle,
} from "@/components/editor/editorUiConstants";
import { DeleteSectionIcon } from "@/components/editor/SidePanelAccordion";
import { middleSectionIds, useEditor } from "@/contexts/EditorContext";
import { confirmAction } from "@/lib/confirm";

export function PageOrderList() {
  const {
    sections,
    selectedSectionId,
    selectSection,
    removeSection,
    reorderSections,
  } = useEditor();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sorted = sections;
  const middle = middleSectionIds(sorted);

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-center text-xs text-muted">
        No blocks yet — add an intro section to start.
      </p>
    );
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const from = middle.indexOf(dragId);
    const to = middle.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const next = [...middle];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    void reorderSections(next);
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <ol className="space-y-1">
      {sorted.map((s, index) => {
        const pinned = isPinnedSectionType(s.type);
        const draggable = !pinned && middle.includes(s.id);
        const isOver = dragOverId === s.id && dragId !== s.id;

        return (
          <li
            key={s.id}
            draggable={draggable}
            onDragStart={() => draggable && setDragId(s.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            onDragOver={(e) => {
              if (!draggable || !dragId) return;
              e.preventDefault();
              setDragOverId(s.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggable) onDrop(s.id);
            }}
            className={`rounded-lg ${isOver ? "ring-2 ring-brand/40" : ""} ${
              dragId === s.id ? "opacity-50" : ""
            }`}
          >
            <div
              className={`flex w-full items-stretch gap-1 rounded-lg ${
                selectedSectionId === s.id
                  ? "bg-brand/15 ring-1 ring-brand/30"
                  : "hover:bg-black/[0.04]"
              }`}
            >
              {draggable ? (
                <span
                  className="flex w-6 shrink-0 cursor-grab items-center justify-center text-muted active:cursor-grabbing"
                  title="Drag to reorder"
                  aria-hidden
                >
                  ⋮⋮
                </span>
              ) : (
                <span
                  className="flex w-6 shrink-0 items-center justify-center text-[10px] text-muted"
                  title="Fixed position"
                >
                  •
                </span>
              )}
              <button
                type="button"
                onClick={() => selectSection(s.id)}
                className="min-w-0 flex-1 py-2 pl-0 pr-1 text-left text-sm"
              >
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/5 text-[10px] font-semibold text-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    {sectionListTitle(s.type, s.data)}
                    {pinned ? (
                      <span className="ml-1 text-[10px] font-normal text-muted">
                        (fixed)
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
              {!pinned ? (
                <div className="flex shrink-0 items-center pr-1.5">
                  <button
                    type="button"
                    title="Delete block"
                    aria-label="Delete block"
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
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
                        void removeSection(s.id);
                      })();
                    }}
                  >
                    <DeleteSectionIcon />
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
