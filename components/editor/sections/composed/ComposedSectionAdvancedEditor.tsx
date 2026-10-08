"use client";

import {
  pathKey,
  removeNodeAtPath,
  updateNodeProp,
} from "@/components/editor/sections/composed/composedTreeEdit";
import { AiFieldGenerateButton } from "@/components/editor/ai/AiFieldGenerateButton";
import { useEditorBusinessContext } from "@/components/editor/ai/useEditorBusinessContext";
import { FieldLabel, Input } from "@/components/ui/Input";
import type { FieldContentType } from "@/lib/fieldContentAi";
import type { ComposedNode } from "@/types/composed-section";
import { parseComposedSectionFromData } from "@/types/composed-section";
import type { PageSection } from "@/types/page";

function nodeLabel(node: ComposedNode, path: number[]): string {
  const base = node.type;
  const text =
    typeof node.props?.text === "string"
      ? node.props.text
      : typeof node.props?.label === "string"
        ? node.props.label
        : "";
  const short = text.trim().slice(0, 40);
  return short ? `${base} · ${short}` : `${base} (${pathKey(path)})`;
}

export function ComposedSectionAdvancedEditor({
  section,
  onUpdateData,
}: {
  section: PageSection;
  onUpdateData: (data: Record<string, unknown>) => void;
}) {
  const composed = parseComposedSectionFromData(section.data);
  if (!composed) {
    return <p className="text-xs text-muted">Invalid custom section data.</p>;
  }

  const sectionDef = composed;
  const businessContext = useEditorBusinessContext();

  function patchSection(updater: (root: ComposedNode) => ComposedNode) {
    onUpdateData({
      ...section.data,
      schemaVersion: 1,
      section: {
        ...sectionDef,
        root: updater(sectionDef.root),
      },
    });
  }

  const flat: { path: number[]; node: ComposedNode }[] = [];
  function walk(node: ComposedNode, path: number[]) {
    flat.push({ path, node });
    (node.children ?? []).forEach((child, i) => walk(child, [...path, i]));
  }
  walk(sectionDef.root, []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Edit parts on the canvas, or remove blocks below. Headlines and body copy live inside the
        design — not a separate section header.
      </p>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted">Parts in this section</p>
        <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-card-border p-2">
          {flat.map(({ path, node }) => {
            const editableText =
              typeof node.props?.text === "string"
                ? node.props.text
                : typeof node.props?.label === "string"
                  ? node.props.label
                  : null;
            return (
              <li
                key={pathKey(path)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-black/[0.02] px-2 py-1.5 text-xs"
              >
                <span className="font-medium">{nodeLabel(node, path)}</span>
                <div className="flex items-center gap-2">
                  {editableText !== null ? (
                    <>
                      <Input
                        className="h-8 min-w-[8rem] text-xs"
                        value={editableText}
                        onChange={(e) => {
                          const prop =
                            typeof node.props?.text === "string" ? "text" : "label";
                          patchSection((root) =>
                            updateNodeProp(root, path, prop, e.target.value)
                          );
                        }}
                      />
                      <AiFieldGenerateButton
                        variant="panel"
                        fieldType={
                          typeof node.props?.label === "string" ? "button" : "heading"
                        }
                        currentValue={editableText}
                        businessContext={businessContext}
                        onApply={(next) => {
                          const prop =
                            typeof node.props?.text === "string" ? "text" : "label";
                          patchSection((root) =>
                            updateNodeProp(root, path, prop, next)
                          );
                        }}
                      />
                    </>
                  ) : null}
                  {path.length > 0 ? (
                    <button
                      type="button"
                      className="text-[10px] font-semibold text-red-600"
                      onClick={() =>
                        onUpdateData({
                          ...section.data,
                          schemaVersion: 1,
                          section: {
                            ...sectionDef,
                            root: removeNodeAtPath(sectionDef.root, path),
                          },
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
