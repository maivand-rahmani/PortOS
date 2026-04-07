"use client";

import { useMemo, useState } from "react";

import {
  detectShortcutBindingConflict,
  type ShortcutBinding,
  type ShortcutPresetId,
} from "@/processes";

import type { UseSettingsAppResult } from "../../model/use-settings-app";
import { ShortcutRecorder } from "./shortcut-recorder";

type KeyboardShortcutsSectionProps = Pick<
  UseSettingsAppResult,
  | "shortcutBindings"
  | "osSettings"
  | "updateShortcutBinding"
  | "resetShortcutBindings"
  | "formatShortcutBindingLabel"
>;

export function KeyboardShortcutsSection({
  shortcutBindings,
  osSettings,
  updateShortcutBinding,
  resetShortcutBindings,
  formatShortcutBindingLabel,
}: KeyboardShortcutsSectionProps) {
  const [editingId, setEditingId] = useState<ShortcutPresetId | null>(null);
  const [conflictMessageMap, setConflictMessageMap] = useState<Record<ShortcutPresetId, string>>({} as Record<ShortcutPresetId, string>);

  const bindingMap = useMemo(
    () => Object.fromEntries(shortcutBindings.map((binding) => [binding.id, binding])) as Record<ShortcutPresetId, (typeof shortcutBindings)[number]>,
    [shortcutBindings],
  );

  const handleStartEdit = (id: ShortcutPresetId) => {
    setEditingId(id);
    setConflictMessageMap((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSave = async (id: ShortcutPresetId, nextBinding: ShortcutBinding) => {
    // Basic validation
    if (nextBinding.kind === "combo" && nextBinding.modifiers.length === 0) {
      setConflictMessageMap((prev) => ({ ...prev, [id]: "Combo must include at least one modifier." }));
      return;
    }

    if (nextBinding.kind === "sequence") {
      if (nextBinding.steps.length !== 2) {
        setConflictMessageMap((prev) => ({ ...prev, [id]: "Sequence must have exactly two steps." }));
        return;
      }
      if (nextBinding.steps[0] !== "space") {
        setConflictMessageMap((prev) => ({ ...prev, [id]: "Sequence must start with Space." }));
        return;
      }
    }

    const conflictId = detectShortcutBindingConflict(osSettings.shortcutBindings, id, nextBinding);

    if (conflictId) {
      setConflictMessageMap((prev) => ({ ...prev, [id]: `Conflicts with ${bindingMap[conflictId]?.label ?? conflictId}.` }));
      return;
    }

    const result = await updateShortcutBinding(id, nextBinding);

    if (result.conflictId) {
      setConflictMessageMap((prev) => ({ ...prev, [id]: `Conflicts with ${bindingMap[result.conflictId!]?.label ?? result.conflictId}.` }));
      return;
    }

    setEditingId(null);
    setConflictMessageMap((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h2>
          <p className="mt-1 text-sm text-muted">
            Customize system-level shortcuts. Sequences like Space then K are now editable.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void resetShortcutBindings()}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition duration-200 hover:border-accent hover:bg-accent hover:text-white"
        >
          Reset Shortcuts
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface/60">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_auto] gap-3 border-b border-border/60 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <span>Action</span>
          <span>Shortcut</span>
          <span>Controls</span>
        </div>

        <div className="divide-y divide-border/50">
          {shortcutBindings.map((binding) => {
            const isEditing = editingId === binding.id;
            const conflictMessage = conflictMessageMap[binding.id];

            return (
              <div key={binding.id} className="flex flex-col">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_auto] gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{binding.label}</p>
                    <p className="mt-1 text-xs text-muted">{binding.scope === "app" ? "Active window only" : "System-wide"}</p>
                  </div>

                  <div className="min-w-0 flex items-center">
                    {isEditing ? (
                      <ShortcutRecorder
                        onCancel={() => setEditingId(null)}
                        onSave={(newBinding) => void handleSave(binding.id, newBinding)}
                      />
                    ) : (
                      <span className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground">
                        {formatShortcutBindingLabel(binding.binding)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(binding.id)}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-background"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {conflictMessage ? (
                  <div className="px-5 pb-3">
                    <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300/90">
                      {conflictMessage}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}